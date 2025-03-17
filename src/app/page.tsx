import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container">
      <h1>Identity Provider Home</h1>
      <p>Welcome to our Identity Provider service.</p>
      <Link href="/login">
        Login
      </Link>
    </div>
  );
}