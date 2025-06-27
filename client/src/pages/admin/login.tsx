import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/SCIENCE HEAVEN ICON PNG_1751016773425.png";

export default function AdminLogin() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoPath} alt="ScienceHeaven" className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl text-white">ScienceHeaven Admin</CardTitle>
          <p className="text-gray-400">Sign in to manage content</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In with Replit
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Admin access required. Contact system administrator for access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
