import React, { useState } from 'react'
import axios from 'axios';

const Home = () => {

    const [gitUrl, setGitUrl] = useState('');
    const [subDomain, setSubDomin] = useState('');
    const [framework, setFramework] = useState('');
    const [isApiCalled, setIsApiCalled] = useState(false);
    const API = 'http://localhost:9000/deploy'

    const submitHandler = async () => {
        try {
            setIsApiCalled(true);
            const response = await axios.post(API, { gitUrl, subDomain, framework });

            if (response.status !== 200) {
                alert('Deployment Failed');
            }
            alert(`Deployment in progress your project url: ${response.data.url}`);

            setGitUrl('');
            setFramework('');
            setSubDomin('');
        } catch (error) {
            console.log(error);
        }finally{
            setIsApiCalled(false);
        }
    }

    return (
        <div className='main-body d-flex justify-content-center align-items-center'>
            <div className="main-contant p-4 border border-primary-subtle rounded">
                <h4 className="heading">
                    Welcome, Sourabh's Deployment House
                </h4>

                <div className="user-form">
                    <label htmlFor="giturlid" className="form-label">GIT URL</label>
                    <input type="text" id="giturlid" onChange={(e) => { setGitUrl(e.target.value) }} className="form-control" />

                    <label htmlFor="subdominid" className="form-label">SUB DOMIN</label>
                    <input type="text" id="subdominid" onChange={(e) => { setSubDomin(e.target.value) }} className="form-control" />

                    <select className="form-select my-3" onChange={(e) => { setFramework(e.target.value) }} aria-label="Default select example">
                        <option value=''>Open this select menu</option>
                        <option value="vite">Vite</option>
                        <option value="react">React</option>
                    </select>

                    {!isApiCalled ?
                        <button type="button" onClick={() => { submitHandler() }} className="btn btn-outline-info">
                            Deploy
                        </button>
                        :
                        <button type="button" className="btn btn-outline-info">
                            Processing...
                            <span> </span>
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </button>
                    } 

                   
                </div>
            </div>
        </div>
    )
}

export default Home