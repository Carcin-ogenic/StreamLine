import React from "react";
import { Button, Card } from "antd";
import { GoogleOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const handleGoogle = () => {
    window.location.href = import.meta.env.VITE_API_URL + "/auth/google";
  };
  const handleEmail = () => {
    navigate("/login/email");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div
        className="
          flex-2
          bg-[url('./assets/hero-bg.avif')]
          bg-cover
          bg-center
          flex
          flex-col
          justify-center
          items-center
          text-white
          p-8
          h-1/2 md:h-full
        "
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-4">StreamLine</h1>

        <p className="text-lg md:text-2xl">Smart campaigns. Smarter insights.</p>
      </div>

      <div className="flex-1 flex justify-center items-center bg-blue-50 p-8 h-1/2 md:h-full">
        <Card className="w-full max-w-sm shadow-lg">
          <Button className="!mb-5" block size="large" icon={<GoogleOutlined />} onClick={handleGoogle}>
            Continue with Google
          </Button>
          <Button block size="large" icon={<MailOutlined />} onClick={handleEmail}>
            Continue with Email
          </Button>
        </Card>
      </div>
    </div>
  );
}
