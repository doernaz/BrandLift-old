import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export const EmailConfig = () => {
    const [smtpStatus, setSmtpStatus] = useState<{ status: string; host?: string } | null>(null);

    useEffect(() => {
        fetch('/api/health')
            .then(res => res.json())
            .then(data => {
                if (data.smtp) setSmtpStatus(data.smtp);
            })
            .catch(console.error);
    }, []);

    const isConnected = smtpStatus?.status === 'CONFIGURED';

    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Gateway
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Hunter.io Verification</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                <span>SMTP Relay ({isConnected ? 'Active' : 'Pending'})</span>
            </div>
            {isConnected && smtpStatus?.host && (
                <div className="mt-2 text-[10px] text-slate-500 font-mono pl-4">
                    Host: {smtpStatus.host}
                </div>
            )}
        </div >
    );
};
