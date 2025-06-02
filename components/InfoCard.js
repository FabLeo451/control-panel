import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

const InfoCard = ({ icon: Icon, title, loading, result, data }) => {
  const renderHeader = () => (
    <div className="flex items-center space-x-2 text-gray-600">
      {Icon && <Icon className="w-6 h-6" />}
      <span><strong>{title}</strong></span>
    </div>
  );

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
        <span>Connection successful</span>
      </div>
      <ul className="mt-2 space-y-1">
        {Object.entries(data || {})
          .filter(([key]) => key !== 'success')
          .map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>: {value}
            </li>
          ))}
      </ul>
    </div>
  );

  const renderFailure = () => (
    <div className="flex items-center space-x-2 text-gray-600">
      <XCircleIcon className="w-6 h-6 text-red-500" />
      <span>Connection failed: {data?.message || 'Unknown error'}</span>
    </div>
  );

  return (
    <div className="bg-gray-100 rounded-lg shadow-md m-3 p-6">
      {renderHeader()}
      <div className="text-sm text-gray-700 break-words mt-4">
        {loading ? renderLoading() : (result ? renderSuccess() : renderFailure())}
      </div>
    </div>
  );
};

export default InfoCard;
