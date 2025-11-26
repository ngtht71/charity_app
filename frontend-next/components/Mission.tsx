import React, { useState } from "react";

const Mission = () => {
  return (
    <section className="py-12 bg-white sm:py-16 lg:py-20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold leading-tight text-gray-800 sm:text-4xl xl:text-4xl font-pj">
            TIÊN PHONG KỶ NGUYÊN THIỆN NGUYỆN SỐ
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600 sm:mt-8 font-pj">
            Ứng dụng sức mạnh Web3 - Trở thành "Người chữa lành" cho thế giới
          </p>
        </div>

        <div className="grid grid-cols-1 mt-10 text-center sm:mt-16 sm:grid-cols-2 sm:gap-x-12 gap-y-12 md:grid-cols-3 md:gap-0 xl:mt-24">
          <div className="md:p-8 lg:p-14">
            <img
              className="w-14 h-14 mx-auto opacity-70"
              src="/images/support.png"
              alt=""
            />
            <h3 className="mt-12 text-xl font-bold text-gray-800 font-pj">
              Hỗ trợ tận tâm
            </h3>
            <p className="mt-5 text-base text-gray-600 font-pj">
              Đội ngũ CSKH luôn sẵn sàng 24/7 để hướng dẫn bạn từng bước, đảm bảo
              trải nghiệm quyên góp suôn sẻ nhất, ngay cả khi bạn mới làm quen với công nghệ.
            </p>
          </div>

          <div className="md:p-8 lg:p-14 md:border-l md:border-gray-200">
            <img
              className="w-14 h-14 mx-auto"
              src="/images/transparency.png"
              alt=""
            />
            <h3 className="mt-12 text-xl font-bold text-gray-800 font-pj">
              Minh bạch tuyệt đối
            </h3>
            <p className="mt-5 text-base text-gray-600 font-pj">
              Chúng tôi đề cao sự trung thực và liêm chính trong việc gây quỹ, đảm bảo mọi
              khoản quyên góp đều được chuyển thẳng trực tiếp đến tổ chức từ thiện mà không qua trung gian,
              không có phí ẩn hoặc hoa hồng.
            </p>
          </div>

          <div className="md:p-8 lg:p-14 md:border-l md:border-gray-200">
            <img
              className="w-14 h-14 mx-auto opacity-[0.85]"
              src="/images/onboarding.png"
              alt=""
            />
            <h3 className="mt-12 text-xl font-bold text-gray-800 font-pj">
              Kết nối đơn giản
            </h3>
            <p className="mt-5 text-base text-gray-600 font-pj">
              Quyên góp chưa bao giờ dễ dàng đến thế. Chỉ cần một thao tác "Kết nối ví",
              bạn đã sẵn sàng chia sẻ yêu thương.
            </p>
          </div>

          <div className="md:p-8 lg:p-14 md:border-t md:border-gray-200">
            <img
              className="w-14 h-14 mx-auto opacity-[0.85]"
              src="/images/product.png"
              alt=""
            />
            <h3 className="mt-12 text-xl font-bold text-gray-800 font-pj">
              Hệ sinh thái đa dạng
            </h3>
            <p className="mt-5 text-base text-gray-600 font-pj">
              Nền tảng tập hợp hàng loạt tổ chức từ thiện uy tín tại một nơi duy nhất.
              Bạn có thể dễ dàng gửi Ether (ETH) hoặc token hỗ trợ bất kỳ dự án nào bạn quan tâm.
            </p>
          </div>

          <div className="md:p-8 lg:p-14 md:border-l md:border-gray-200 md:border-t">
            <img
              className="w-14 h-14 mx-auto"
              src="/images/quality.png"
              alt=""
            />
            <h3 className="mt-12 text-xl font-bold text-gray-800 font-pj">
              Kiểm duyệt khắt khe
            </h3>
            <p className="mt-5 text-base text-gray-600 font-pj">
              Mọi dự án xuất hiện trên website đều phải trải qua quy trình thẩm định
              nghiêm ngặt về tính pháp lý và năng lực thực thi để bảo vệ niềm tin của bạn.            </p>
          </div>

          <div className="md:p-8 lg:p-14 md:border-l md:border-gray-200 md:border-t">
            <img
              className="w-14 h-14 mx-auto opacity-90"
              src="/images/result.png"
              alt=""
            />
            <h3 className="mt-12 text-xl font-bold text-gray-800 font-pj">
              Hiệu quả thực tế
            </h3>
            <p className="mt-5 text-base text-gray-600 font-pj">
              Với công nghệ minh bạch, bạn hoàn toàn yên tâm rằng sự đóng góp của mình
              đang tạo ra tác động thực sự và thay đổi cuộc sống của những người cần giúp đỡ.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Mission;
