const express = require('express');
const { generateSlug } = require("random-word-slugs");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const cors = require("cors");

const app = express();

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION || '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});

const config = {
    CLUSTER: process.env.ECS_CLUSTER_NAME || "",
    TASK: process.env.ECS_TASK_DEF_ARN || ""
}


app.use(express.json());
app.use(cors());

const port = 9000;

app.post('/deploy', async (req, res) => {
    try {
        let { subDomain, gitUrl, framework } = req.body;

        if (!gitUrl || !framework) {
            return res.status(400).json({ msg: 'Missing required fields', status: false })
        };

        if (!subDomain) subDomain = generateSlug();

        const command = new RunTaskCommand({
            cluster: config.CLUSTER,
            taskDefinition: config.TASK,
            launchType: 'FARGATE',
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    assignPublicIp: 'ENABLED',
                    subnets: ['', '', ''],
                    securityGroups: ['']
                }
            },
            overrides: {
                containerOverrides: [
                    {
                        name: 'build-image',
                        environment: [
                            { name: "GIT_REPOSITORY_URL", value: gitUrl },
                            { name: "PROJECT_ID", value: subDomain },
                            { name: "FRAME_WORK", value: framework },
                            { name: "REGION", value: process.env.AWS_REGION || '' },
                            { name: "ACCESS_KEY_ID", value: process.env.AWS_ACCESS_KEY_ID || "" },
                            { name: "SECRET_ACCESS_KEY", value: process.env.AWS_SECRET_ACCESS_KEY || "" },
                        ]
                    }
                ]
            }
        });

        await ecsClient.send(command);
        return res.status(200).json({
            msg: `queued`, url: `http://${subDomain}.localhost:8000`, status: true
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({ msg: 'something went wrong', result: [], status: false })
    }
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})