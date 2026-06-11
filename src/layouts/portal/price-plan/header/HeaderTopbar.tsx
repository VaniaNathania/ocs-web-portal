import { useRef } from 'react';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';
import { Menu, MenuItem, MenuToggle } from '@/components';
import { DropdownUser } from '@/partials/dropdowns/user';
import { useLanguage } from '@/i18n';

const HeaderTopbar = () => {
  const itemChatRef = useRef<any>(null);
  const itemUserRef = useRef<any>(null);
  const itemNotificationsRef = useRef<any>(null);
  const { isRTL } = useLanguage();

  const handleDropdownChatShow = () => {
    window.dispatchEvent(new Event('resize'));
  };

  return (
    <div className="flex items-center gap-3.5">
      <Menu>
        <MenuItem
          ref={itemUserRef}
          toggle="dropdown"
          trigger="click"
          dropdownProps={{
            placement: isRTL() ? 'bottom-start' : 'bottom-end',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [20, 10] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuToggle className="btn btn-icon rounded-full">
            <img
              className="size-9 rounded-full justify-center border border-gray-500 shrink-0"
              src={toAbsoluteUrl('/media/avatars/blank.png')}
              alt=""
            />
          </MenuToggle>
          {DropdownUser({ menuItemRef: itemUserRef })}
        </MenuItem>
      </Menu>
    </div>
  );
};

export { HeaderTopbar };
