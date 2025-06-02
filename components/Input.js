
export default function Input({ children, className = '', ...props }) {
  return (
    <input
      className={`border rounded-sm border-gray-300 p-2 focus:outline-none focus:ring-0 focus:border-gray-400 ${className}`}
      {...props}
    />
  );
}
