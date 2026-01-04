import Logo from "/images/logo.svg";
import { UserRoundIcon } from "lucide-react";

const TopBar = () => {
  return (
    <header className="flex sticky top-0 border-b bg-background flex-row items-center justify-between w-full px-8 py-4 z-10">
      <div className="flex items-center gap-2">
        <img src={Logo} alt="OpsPilot AI" width={30} height={30} />
        <p className="text-2xl font-bold">OpsPilot AI</p>
      </div>

      <UserRoundIcon className="w-5 h-5 cursor-pointer" />
    </header>
  );
};

export default TopBar;
