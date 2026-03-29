import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './authContext'
import axios from 'axios'

export const userDataContext = createContext()
function UserContext({children}) {
    let [userData,setUserData] = useState("")
    let {serverUrl} = useContext(authDataContext)


   const getCurrentUser = async () => {
        try {
            let result = await axios.get(serverUrl + "/api/user/getcurrentuser",{withCredentials:true})

            setUserData(result.data)
            console.log(result.data)

        } catch (error) {
            setUserData(null)
            console.log(error)
        }
    }

    const toggleWishlist = async (productId) => {
        try {
            let result = await axios.post(serverUrl + "/api/user/wishlist/toggle", { productId }, { withCredentials: true });
            if (result.status === 200) {
                // Update local context
                setUserData(prev => ({
                    ...prev,
                    wishlist: result.data // The backend returns the updated wishlist array
                }));
                return result.data;
            }
        } catch (error) {
            console.log("Error toggling wishlist", error);
            throw error;
        }
    }

    useEffect(()=>{
     getCurrentUser()
    },[])



    let value = {
     userData,setUserData,getCurrentUser, toggleWishlist
    }
    
   
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
