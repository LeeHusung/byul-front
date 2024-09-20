import { Notify } from 'quasar';

export const notify = (type, message, position = 'top', icon = null) => {
  Notify.create({
    type: type,
    icon: icon,
    message: message,
    position: position
  });
};
