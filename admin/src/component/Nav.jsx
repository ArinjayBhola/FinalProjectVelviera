import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "axios";
import { authDataContext } from "../context/AuthContext";
import { adminDataContext } from "../context/AdminContext";
import { useModal } from "../context/ModalContext";

function Nav() {
  let navigate = useNavigate();
  let { serverUrl } = useContext(authDataContext);
  let { getAdmin } = useContext(adminDataContext);
  const { showAlert } = useModal();

  const logOut = async () => {
    try {
      const result = await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true });
      console.log(result.data);
      showAlert("Logged Out", "You have been successfully logged out of the admin panel.", "success");
      getAdmin();
      navigate("/login");
    } catch (error) {
      console.log(error);
      showAlert("Error", "Logout failed. Please try again.", "error");
    }
  };
  return (
    <div className="w-[100vw] h-[70px] bg-[#dcdbdbf8] z-10 fixed top-0 flex  items-center justify-between px-[30px] overflow-x-hidden shadow-md shadow-black ">
      <div
        className="w-[30%]  flex items-center justify-start   gap-[10px] cursor-pointer "
        onClick={() => navigate("/")}>
        <img
          src={logo}
          alt=""
          className="w-[30px]"
        />
        <h1 className="text-[25px] text-[black] font-sans ">Velviera</h1>
      </div>
      <button
        className="text-[15px] hover:border-[2px] border-[#89daea] cursor-pointer bg-[#000000ca] py-[10px] px-[20px] rounded-2xl text-white "
        onClick={logOut}>
        LogOut
      </button>
    </div>
  );
}

export default Nav;
