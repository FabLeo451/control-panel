
export default function ResultBox({ children, className = '', ...props }) {

  var color = props.fail ? 'bg-red-100' : 'bg-green-100';
  var borderColor = props.fail ? 'border-red-800' : 'border-green-800';

  return (
    <div
      className={`px-4 py-2 border ${color} ${borderColor} rounded ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
