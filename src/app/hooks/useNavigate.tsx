import { useRouter } from 'next/navigation';

export const useNavigate = () => {
  const router = useRouter();

  const navigateToUrl = (section: string, id?: string) => {
    if (id) {
      router.push(`/${section}/${id}`);
    } else {
      router.push(`/${section}`);
    }
  };

  const navigateToHome = () => {
    router.replace('/');
  };

  const refresh = router.refresh;
  return {
    navigateToUrl,
    navigateToHome,
    refresh,
  };
};
