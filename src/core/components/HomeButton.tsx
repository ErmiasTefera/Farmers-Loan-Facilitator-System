import { APP_ROUTES } from "@/core/constants/routes.constant";

export const HomeButton = () => {
    return (
        <a href={APP_ROUTES.DISCOVERY.root} className="flex items-center gap-2 font-medium">
        <img 
          src="https://iphce.org/wp-content/uploads/2021/08/output-onlinepngtools-e1627043832524-1-e1630407557168.png" 
          alt="Home" 
          className="w-40 h-10 rounded-md object-contain"
        />
      </a>
    )
}