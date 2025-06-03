import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAppDispatch } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

import type { User } from '../types';

interface UserMenuProps {
  user: User | null;
  onLogout?: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await dispatch(logout()).unwrap();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex items-center max-w-xs text-sm bg-[#384252] rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <span className="sr-only">Open user menu</span>
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </span>
            <UserCircleIcon className="w-8 h-8 text-gray-300" aria-hidden="true" />
          </div>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-gray-800 rounded-md shadow-lg ring-1 ring-gray-700 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm text-white">{user?.firstName} {user?.lastName}</p>
            <span className="block text-sm text-gray-400">
              {user?.email}
            </span>
            <span className="block text-xs text-gray-500">
              {user?.roles?.join(', ')}
            </span>
          </div>
          <div className="border-t border-gray-700">
           
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-700' : ''
                  } w-full text-left group flex items-center px-4 py-2 text-sm text-gray-200`}
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" aria-hidden="true" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
