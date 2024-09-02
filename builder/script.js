const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const mine = require('mime-types');

const s3Client = new S3Client({
    region: process.env.REGION || '',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || "",
        secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
    }
});

const PROJECT_ID = process.env.PROJECT_ID || "pr1";
const FRAME_WORK = process.env.FRAME_WORK || "vite";

async function init() {
    console.log(`Starting Executing script file....`);
    const outputPath = path.join(__dirname, 'output');

    const p = exec(`cd ${outputPath} && npm install && npm run build`);
    console.log(`log: npm install`);
    console.log(`log: npm run build`);

    p.stdout.on('data', (data) => {
        console.log(`log : ${data.toString()}`);
    });

    p.stdout.on("error", (error) => {
        console.error(`error: ${error.toString()}`);
    });

    p.stdout.on("close", async (done) => {
        console.log(`build execution completed successfully.`);
        let distFolderPath = '';
        if (FRAME_WORK == 'vite') {
            distFolderPath = path.join(__dirname, "output", 'dist');
        } else if (FRAME_WORK == 'react') {
            distFolderPath = path.join(__dirname, "output", 'build');
        };

        const distFiles = fs.readdirSync(distFolderPath, { recursive: true });

        console.log(`log: start pushing files`);
        for (let file of distFiles) {
            const filePath = path.join(distFolderPath, file);
            if (fs.lstatSync(filePath).isDirectory()) continue;
            console.log(`log: uploading ${filePath}`);

            const command = new PutObjectCommand({
                Bucket: bucket_name,
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mine.lookup(filePath)
            });
            await s3Client.send(command);
        }
        console.log(`log: File uploading completed successfully`);
        process.exit(1);
    });
}

if (FRAME_WORK == 'vite') {
    console.log(`log: framework - ${FRAME_WORK}`);
    init();
} else if (FRAME_WORK == 'react') {
    console.log(`log: framework - ${FRAME_WORK}`);
    init();
}
else {
    console.log("log: Unsupported framework, please choose vite or vue");
    process.exit(1);
}

