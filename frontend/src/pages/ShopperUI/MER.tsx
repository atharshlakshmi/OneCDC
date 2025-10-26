import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

interface Shop {
  id: number;
  name: string;
}

const MER: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // receive selectedShops via navigation state
  const { selectedShops }: { selectedShops?: Shop[] } = location.state || {};

  return (
    <div>
        <PageHeader title="Generated Route" />
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-50 pb-24">
      

      <div className="w-full max-w-3xl mt-6 px-6">
        {!selectedShops || selectedShops.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No shops selected. Please return to your cart.</p>
            <Button
              onClick={() => navigate("/ViewCart")}
              className="mt-4 bg-amber-400 hover:bg-amber-500 text-white"
            >
              Back to Cart
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-gray-700 text-center">
              Mock Route Plan
            </h2>
            <p className="text-center text-gray-500">
              (This is a mock route visualization — replace this later with a real map.)
            </p>

            <div className="flex flex-col gap-4 mt-4">
              {selectedShops.map((shop, index) => (
                <div
                  key={shop.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-3"
                >
                  <span className="font-medium text-gray-700">
                    {index + 1}. {shop.name}
                  </span>
                  {index < selectedShops.length - 1 && (
                    <span className="text-sm text-gray-400">→ Next Stop</span>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate("/ViewCart")}
              className="self-center mt-6 bg-amber-400 hover:bg-amber-500 text-white"
            >
              Back to Cart
            </Button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default MER;
