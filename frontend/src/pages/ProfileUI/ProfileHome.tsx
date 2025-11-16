import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserCircle, MessageSquare, Flag, Store } from "lucide-react";

export default function ProfileHome() {
  const navigate = useNavigate();
  const { isAuthed, checked, user } = useAuth();

  // Defensive check: redirect if not authenticated
  useEffect(() => {
    if (checked && !isAuthed) {
      navigate("/login", { replace: true });
    }
  }, [checked, isAuthed, navigate]);

  // Show loading while checking auth status
  if (!checked) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-600">Checking session…</div>;
  }

  // Conditional navigation cards based on user role
  const isOwner = user?.role === "owner";

  const navigationCards = [
    {
      title: "User Details",
      description: "View and edit your profile information",
      icon: UserCircle,
      path: "/profile/details",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconColor: "text-blue-600",
      showFor: ["registered_shopper", "owner"], // Show for both roles
    },
    {
      title: "My Reviews",
      description: "See all reviews you've posted",
      icon: MessageSquare,
      path: "/profile/reviews",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      iconColor: "text-green-600",
      showFor: ["registered_shopper"], // Only shoppers can post reviews
    },
    {
      title: "Flagged Reviews",
      description: "Your reviews that have been flagged by admin",
      icon: Flag,
      path: "/profile/reports",
      color: "bg-red-50 hover:bg-red-100 border-red-200",
      iconColor: "text-red-600",
      showFor: ["registered_shopper"], // Only shoppers have reviews to be flagged
    },

    {
      title: "Flagged Stores",
      description: "Your stores that have been flagged by admin",
      icon: Flag,
      path: "/profile/flagged-stores",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      iconColor: "text-orange-600",
      showFor: ["owner"], // Only owners have stores to be flagged
    },
  ].filter((card) => card.showFor.includes(user?.role || ""));

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Profile</h1>
      <p className="text-gray-600 mb-8">Manage your account settings and activity</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {navigationCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              className={`${card.color} border-2 rounded-2xl p-6 text-left transition-all duration-200 shadow-sm hover:shadow-md`}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`${card.iconColor} p-4 bg-white rounded-full shadow-sm`}>
                  <Icon size={32} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{card.title}</h2>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
