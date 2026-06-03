import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export const useAuthRedirect = () => {
  const router = useRouter();

  const redirectToLoginWithReturn = (returnPath: string) => {
    const encodedReturnPath = encodeURIComponent(returnPath);
    router.push(`/login?redirect=${encodedReturnPath}`);
  };

  const handleProtectedAction = (action: () => void, returnPath: string) => {
    const token = Cookies.get('access_token');
    if (!token) {
      redirectToLoginWithReturn(returnPath);
      return;
    }
    action();
  };

  return { handleProtectedAction, redirectToLoginWithReturn };
};
