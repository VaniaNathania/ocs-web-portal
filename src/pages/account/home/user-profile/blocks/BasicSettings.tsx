import { useState, useContext, useEffect } from "react";
import { Profile, useAccountUserProfileContext } from "../hooks";

// import { KeenIcon } from '@/components';
// import { toAbsoluteUrl } from '@/utils/Assets';
import { getAuth, useAuthContext } from "@/auth";
import { toast } from "sonner";

interface IBasicSettingsProps {
  title: string;
}

const BasicSettings = () => {
  // const user = localStorage.getItem('user');
  // const parsedUser = user ? JSON.parse(user) : null;
  const { setProfile, profile } = useAccountUserProfileContext();
  const [newProfile, setNewProfile] = useState<Profile | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewProfile(profile);
  }, [profile]);

  const handleChangeProfile = async () => {
    setIsSubmitting(true);
    try {
      await setProfile(newProfile);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while resetting the password.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card pb-2.5">
      <div className="card-header" id="general_settings">
        <h3 className="card-title">Account</h3>
      </div>

      <div className="card-body grid gap-5">
        {/* <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <label className="form-label max-w-56">Name</label>
          <input
            className="input"
            type="text"
            value={newProfile?.name}
            onChange={(e) =>
              setNewProfile((prev) => ({ ...prev, name: e.target.value }))
            }
            disabled={isSubmitting}
          />
        </div> */}
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <label className="form-label max-w-56">Username</label>
          <input
            className="input"
            type="text"
            value={newProfile?.username ?? ""}
            onChange={(e) =>
              setNewProfile((prev) => ({ ...prev, username: e.target.value }))
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <label className="form-label max-w-56">Email</label>
          <input
            className="input"
            type="email"
            value={newProfile?.email ?? ""}
            onChange={(e) =>
              setNewProfile((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={isSubmitting}
          />
        </div>
        {/* <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
          <label className="form-label max-w-56">Name</label>
          <input className="input" type="text" value={parsedUser?.name} />
        </div> */}
        {/* <div className="flex justify-end">
          <button
            className="btn btn-primary"
            onClick={handleChangeProfile}
            disabled={isSubmitting}
          >
            {isSubmitting ? "loading..." : "Save Change"}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export { BasicSettings, type IBasicSettingsProps };
