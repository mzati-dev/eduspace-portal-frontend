import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
    error: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Student Not Found</h3>
            <p className="text-red-600">{error}</p>
        </div>
    );
};

export default ErrorMessage;