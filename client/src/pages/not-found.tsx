import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [_, navigate] = useLocation();
  
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md mx-4 bg-darkElevated border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-3">
            <AlertCircle className="h-8 w-8 text-error" />
            <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          </div>

          <p className="mt-4 text-gray-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Button 
            className="mt-6 w-full" 
            onClick={() => navigate("/")}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
