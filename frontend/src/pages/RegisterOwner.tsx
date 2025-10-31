import RegisterForm from "../components/RegisterForm";

export default function RegisterOwner() {
  return (
    <RegisterForm
      title="Create Owner Account"
      endpoint="/auth/register/owner"
      includeUEN={true} // show UEN input
      redirectTo="/login"
      padClass="pt-16 sm:pt-5" // 👈 moved up slightly (from 20/28)
    />
  );
}
