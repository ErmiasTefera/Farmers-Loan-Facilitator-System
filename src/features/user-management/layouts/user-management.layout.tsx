import React from 'react';
import { Outlet } from '@tanstack/react-router';

export default function UserManagementLayout(): React.JSX.Element {
	return (
		<div>
            <header>
                <h1>User Management Layout</h1>
            </header>
            <main>
                <Outlet />
            </main>
		</div>
	);
}