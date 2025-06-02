import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

const ResultRow = ({ icon: Icon, label, loading, result, data, successMessage, warningMessage }) => {

  const renderLoading = () => (
    <div className="flex items-center space-x-2 text-gray-600">
      <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
      <span>Connecting...</span>
    </div>
  );

  const renderSuccess = () => (
    <div>
      <div className="flex items-center space-x-2 text-gray-600">
        <CheckCircleIcon className="w-6 h-6 text-green-500" />
        <span>{ successMessage ? successMessage : "Connection successful" }</span>
      </div>
    </div>
  );

  const renderFailure = () => (
    <div className="flex items-center space-x-2 text-gray-600">
      {warningMessage ? <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" /> : <XCircleIcon className="w-6 h-6 text-red-500" />}
      <span>{warningMessage ? warningMessage : ((data?.message + ' - ' + data?.details) || 'Unknown error')}</span>
    </div>
  );

  return (
    <>
      <div className="flex items-center space-x-2 text-gray-600">
        {Icon && <Icon className="w-6 h-6" />}
        <span><strong>{label}</strong></span>
      </div>
      <div>{loading ? renderLoading() : (result ? renderSuccess() : renderFailure())}</div>
    </>
  );
};

export default ResultRow;
