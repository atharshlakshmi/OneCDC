import RegisterForm from "../../components/RegisterForm";

export default function RegisterShopper() {
  return <RegisterForm title="Create Shopper Account" endpoint="/auth/register/shopper" includeUEN={false} redirectTo="/login" />;
}
