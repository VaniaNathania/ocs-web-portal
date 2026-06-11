import { useContext } from "react";
import { SubscriberListContext } from "./SubscriberListContext";

const useSubscriberListContext = () => {
    const context = useContext(SubscriberListContext);

    if (!context)
        throw new Error(
            "SubscriberListContext must be used within AuthProvider"
        );

    return context;
};

export { useSubscriberListContext };
