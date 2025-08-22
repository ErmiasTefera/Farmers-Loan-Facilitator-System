import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { TopbarNav } from '@/core/components/TopbarNav';
import { SimpleFooter } from '@/core/components/Footer';

export default function HomeLayout(): React.JSX.Element {
	return (
		<div className="min-h-screen flex flex-col">
			<TopbarNav />
			<main className="flex-1">
				<Outlet />
			</main>
			<SimpleFooter />
		</div>
	);
}