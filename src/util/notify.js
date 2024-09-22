import { Notify } from 'quasar';

export const notify = (type, message, position = 'top', icon = null) => {
  Notify.create({
    type: type,
    icon: icon,
    message: message,
    position: position
  });
};

export const notifyError = (error) => {
  notify(
    'negative',
    `${error.response.data.message || error.response.data.errors[0].reason || '오류가 발생했습니다'}`
  );
};
