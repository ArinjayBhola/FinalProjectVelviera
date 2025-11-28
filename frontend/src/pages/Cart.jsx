import React, { useContext, useEffect, useState } from 'react'
import Title from '../component/Title'
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { RiDeleteBin6Line } from "react-icons/ri";
import CartTotal from '../component/CartTotal';

function Cart() {
    const { products, currency, cartItem ,updateQuantity } = useContext(shopDataContext)
  const [cartData, setCartData] = useState([])
  const navigate = useNavigate()


  useEffect(() => {
    const tempData = [];
    for (const items in cartItem) {
      for (const item in cartItem[items]) {
        if (cartItem[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItem[items][item],
          });
        }
      }
    }
    setCartData(tempData); 

  }, [cartItem]);
  return (
    <div className='w-[99vw] min-h-[100vh] p-[20px] overflow-hidden bg-gradient-to-l from-[#141414] to-[#0c2025] '>
      <div className='h-[8%] w-[100%] text-center mt-[80px]'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div className='w-[100%] h-[92%] flex flex-col gap-[20px]'>
        {
         cartData.map((item,index)=>{
             const productData = products.find((product) => product._id === item._id);
            
             return (
              <div key={index} className='w-[100%] border-t border-b py-4'>
                <div className='flex items-center justify-between gap-6 bg-[#51808048] py-[10px] px-[20px] rounded-2xl'>
                    <div className='flex items-start gap-6'>
                        <img className='w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-md object-cover' src={productData.image1} alt="" />
                        <div className='flex flex-col gap-[10px]'>
                            <p className='md:text-[25px] text-[18px] font-medium text-[#f3f9fc]'>{productData.name}</p>
                            <div className='flex items-center gap-[15px]'>
                                <p className='text-[18px] text-[#aaf4e7]'>{currency} {productData.price}</p>
                                <p className='px-3 py-1 text-[16px] text-[white] bg-[#518080b4] rounded-md border-[1px] border-[#9ff9f9]'>{item.size}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className='flex items-center gap-4 sm:gap-8'>
                        <input type="number" min={1} defaultValue={item.quantity} className='w-16 sm:w-20 px-2 py-2 text-[white] text-[18px] font-semibold bg-[#518080b4] border-[1px] border-[#9ff9f9] rounded-md text-center'  onChange={(e)=> (e.target.value === ' ' || e.target.value === '0') ? null  :  updateQuantity(item._id,item.size,Number(e.target.value))} />
                        <RiDeleteBin6Line  className='text-[#9ff9f9] w-[25px] h-[25px] cursor-pointer hover:text-red-400 transition-colors' onClick={()=>updateQuantity(item._id,item.size,0)}/>
                    </div>
                </div>
              </div>
             )
         })
        }
      </div>

      <div className='flex justify-start items-end my-20'>
        <div className='w-full sm:w-[450px]'>
            <CartTotal/>
            <button className='text-[18px] hover:bg-slate-500 cursor-pointer bg-[#51808048] py-[10px] px-[50px] rounded-2xl text-white flex items-center justify-center gap-[20px]  border-[1px] border-[#80808049] ml-[30px] mt-[20px]' onClick={()=>{
                if (cartData.length > 0) {
      navigate("/placeorder");
    } else {
      console.log("Your cart is empty!");
    }
            }}>
                PROCEED TO CHECKOUT
            </button>
        </div>
      </div>
      
    </div>
  )
}

export default Cart
