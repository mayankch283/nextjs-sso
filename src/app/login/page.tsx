import { useRouter } from 'next/router';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { sessionId } = router.query;

  return (
    <div className="container">
      <h1>Identity Provider</h1>
      {sessionId && <p>Sign in to continue to the requested service</p>}
      <LoginForm sessionId={sessionId as string} />
    </div>
  );
}