import React from 'react';
interface SimpleFooterProps {
	className?: string;
}

export const SimpleFooter: React.FC<SimpleFooterProps> = ({ 
	className
}) => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className={`bg-background border-t py-6 ${className || ''}`}>
			<div className="container mx-auto px-4 flex flex-col items-center">
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					{/* Copyright */}
					<div className="text-sm text-muted-foreground text-center md:text-left">
						© {currentYear} Nexify Technologies. All rights reserved.
					</div>
				</div>
			</div>
		</footer>
	);
};
