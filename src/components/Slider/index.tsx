import React, { FC, ReactNode } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import "./style.scss";
// Import Swiper styles
import "swiper/swiper.min.css";
import "swiper/components/pagination/pagination.min.css";

// import Swiper core and required modules
import SwiperCore, { Mousewheel, Pagination } from "swiper/core";
import Header from "../Header";
import Footer from "../Footer";

// install Swiper modules
SwiperCore.use([Mousewheel, Pagination]);

const Slider: FC<{ slides: ReactNode[] }> = ({ slides }) => {
  return (
    <>
      <Swiper
        direction={"vertical"}
        slidesPerView={1}
        spaceBetween={30}
        mousewheel={true}
        autoHeight={true}
        scrollbar={true}
        pagination={{
          clickable: true,
        }}
        className="mySwiper"
      >
        <Header />

        {slides.map((slide, index) => (
          <SwiperSlide key={index}>{slide}</SwiperSlide>
        ))}
        <Footer />
      </Swiper>
    </>
  );
};

export default Slider;
