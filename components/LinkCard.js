
import Link from 'next/link';

const LinkCard = ({ icon: Icon, title, href, description }) => {
	return (
		<div className="bg-gray-100 rounded-lg shadow-md p-6 max-w-md">
			<Link
				href={href}
				className="flex items-center text-lg font-bold text-blue-600 hover:underline"
			>
				{Icon && <Icon className="w-5 h-5 mr-2 text-blue-600" />}
				{title}
			</Link>
			<p className="text-sm text-gray-700 mt-2">{description}</p>
		</div>
	);
};

export default LinkCard;
