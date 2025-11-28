import React, { useContext, useEffect, useState } from 'react'
import { FaChevronRight, FaChevronLeft, FaChevronDown } from "react-icons/fa";
import Title from '../component/Title';
import { shopDataContext } from '../context/ShopContext';
import Card from '../component/Card';

function Collections() {

    let [showFilter,setShowFilter] = useState(false)
    let {products,search,showSearch} = useContext(shopDataContext)
    let [filterProduct,setFilterProduct] = useState([])
    let [category,setCaterory] = useState([])
    let [subCategory,setSubCaterory] = useState([])
    let [sortType,SetSortType] = useState("relavent")

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const toggleCategory = (e) =>{
        if(category.includes(e.target.value)){
            setCaterory(prev => prev.filter(item => item !== e.target.value))
        }else
         {
            setCaterory(prev => [...prev,e.target.value])
         }
    }

    const toggleSubCategory = (e) =>{
         if(subCategory.includes(e.target.value)){
            setSubCaterory(prev => prev.filter(item => item !== e.target.value))
        }else
         {
            setSubCaterory(prev => [...prev,e.target.value])
         }
    }

    const applyFilter = ()=>{
        let productCopy = products.slice()

        if(showSearch && search){
            productCopy = productCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
        }
        if(category.length > 0)
        {
            productCopy = productCopy.filter(item => category.includes(item.category))
        }
        if(subCategory.length > 0)
        {
            productCopy = productCopy.filter(item => subCategory.includes(item.subCategory))
        }
        setFilterProduct(productCopy)
    }


    const sortProducts = (e)=>{
        let fbCopy = filterProduct.slice()

        switch(sortType){
         case 'low-high':
            setFilterProduct(fbCopy.sort((a,b)=>(a.price - b.price)))
        break;

         case 'high-low':
            setFilterProduct(fbCopy.sort((a,b)=>(b.price - a.price)))
        break;
        default:
            applyFilter()
        break;
        }

    }

    useEffect(()=>{
        sortProducts()
    },[sortType])


    useEffect(()=>{
    setFilterProduct(products)
    },[products])

    useEffect(()=>{
        applyFilter();
        setCurrentPage(1); // Reset to page 1 when filters change
    },[category,subCategory,search ,showSearch])

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filterProduct.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filterProduct.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  return (
    <div className='w-[99vw]  min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] flex items-start flex-col md:flex-row justify-start  pt-[70px] overflow-x-hidden z-[2] pb-[110px]'>
      <div className={`md:w-[30vw] lg:w-[20vw] w-[100vw] md:min-h-[100vh] ${showFilter ? "h-[45vh]" :"h-[8vh]"}  p-[20px] border-r-[1px] border-gray-400  text-[#aaf5fa] lg:fixed `}>
        <p className='text-[25px] font-semibold flex gap-[5px] items-center justify-start cursor-pointer' onClick={()=>setShowFilter(prev=>!prev)}>FILTERS
            {!showFilter && <FaChevronRight className='text-[18px] md:hidden'  />}
           {showFilter && <FaChevronDown className='text-[18px] md:hidden'  />}
        </p>
        

        <div className={`border-[2px] border-[#dedcdc] pl-5 py-3 mt-6 rounded-md bg-slate-600 ${showFilter ? "" : "hidden"} md:block`}>
            <p className='text-[18px] text-[#f8fafa]'>CATEGORIES</p>
            <div className='w-[230px] h-[120px]  flex items-start justify-center gap-[10px] flex-col'>
                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'> <input type="checkbox" value={'Men'} className='w-3' onChange={toggleCategory} /> Men</p>
                 <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'> <input type="checkbox" value={'Women'} className='w-3' onChange={toggleCategory} /> Women</p>
                  <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'> <input type="checkbox" value={'Kids'} onChange={toggleCategory} className='w-3' /> Kids</p>
            </div>
        </div>
        <div className={`border-[2px] border-[#dedcdc] pl-5 py-3 mt-6 rounded-md bg-slate-600 ${showFilter ? "" : "hidden"} md:block`}>
            <p className='text-[18px] text-[#f8fafa]'>SUB-CATEGORIES</p>
            <div className='w-[230px] h-[120px]  flex items-start justify-center gap-[10px] flex-col'>
                <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'> <input type="checkbox" value={'TopWear'} className='w-3' onChange={toggleSubCategory} /> TopWear</p>
                 <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'> <input type="checkbox" value={'BottomWear'} className='w-3' onChange={toggleSubCategory} /> BottomWear</p>
                  <p className='flex items-center justify-center gap-[10px] text-[16px] font-light'> <input type="checkbox" value={'WinterWear'} className='w-3' onChange={toggleSubCategory} /> WinterWear</p>
            </div>
        </div>
      </div>
      <div className='lg:pl-[20%] md:py-[10px] w-full'>
        <div className=' md:w-[80vw] w-[100vw]    flex  justify-between flex-col lg:flex-row lg:px-[50px] '>
            <Title text1={"ALL"} text2={"COLLECTIONS"}/>

            <select name="" id="" className='bg-slate-600 w-[60%] md:w-[200px] h-[50px] px-[10px] text-[white] rounded-lg hover:border-[#46d1f7] border-[2px]' onChange={(e)=>SetSortType(e.target.value)}>
                <option value="relavent" className='w-[100%] h-[100%]'>Sort By: Relavent</option>
                <option value="low-high" className='w-[100%] h-[100%]'>Sort By: Low to High</option>
                <option value="high-low" className='w-[100%] h-[100%]'>Sort By: High to Low</option>
            </select>
        </div>
        <div className='lg:w-[80vw] md:w-[60vw]   w-[100vw] min-h-[70vh] flex items-center justify-center flex-wrap gap-[30px]'>
            {
             currentProducts.map((item,index)=>(
                <Card key={index} id={item._id} name={item.name} price={item.price} image={item.image1}/>
             ))
            }
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10 mb-10 w-full">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-3 rounded-full border transition-all duration-200 ${currentPage === 1 ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-white text-white hover:bg-white hover:text-black cursor-pointer'}`}
                >
                    <FaChevronLeft />
                </button>
                
                <div className="flex gap-2 flex-wrap justify-center">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`w-10 h-10 flex items-center justify-center rounded-md border transition-all duration-200 ${currentPage === i + 1 ? 'bg-white text-black border-white font-bold scale-110' : 'border-gray-600 text-gray-300 hover:border-white hover:text-white'}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-full border transition-all duration-200 ${currentPage === totalPages ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-white text-white hover:bg-white hover:text-black cursor-pointer'}`}
                >
                    <FaChevronRight />
                </button>
            </div>
        )}
      </div>
    </div>
  )
}

export default Collections