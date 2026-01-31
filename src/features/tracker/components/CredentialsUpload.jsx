import React from 'react';

const CredentialsUpload = ({ onUpload }) => {
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                onUpload(json);
            } catch (err) {
                alert("Invalid JSON");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-200 font-sans selection:bg-indigo-500/30">
            <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome Back</h1>
                    <p className="text-zinc-500 text-sm">Upload your service account key to continue.</p>
                </div>

                <div className="relative group">
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".json"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border border-dashed border-zinc-800 bg-zinc-900/50 rounded-xl p-8 text-center transition-all group-hover:border-zinc-700 group-hover:bg-zinc-900">
                        <div className="mx-auto w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <span className="text-sm font-medium text-zinc-300">Click to upload credentials.json</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CredentialsUpload;
