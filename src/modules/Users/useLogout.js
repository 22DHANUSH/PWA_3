import { useDispatch } from "react-redux";
import { clearUser } from "./users.slice";
import { useNavigate } from "react-router-dom";

export default function useLogout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(clearUser());
    navigate("/");
  };

  return logout;
}