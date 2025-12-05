import React, { useState } from "react";
import { adminService } from '../services/api'
import '../index.css'
const AdminUpload = () => {
  const [form, setForm] = useState({
    applianceType: "",
    manufacturer: "",
    productName: "",
    totalPages: ""
  });
  const [file, setFile] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("applianceType", form.applianceType);
    formData.append("manufacturer", form.manufacturer);
    formData.append("productName", form.productName);
    formData.append("totalPages", form.totalPages);
    formData.append("file", file);

   adminService.addCookBook(formData)
        .then(res => console.log("업로드 성공:", res.data))
        .catch(err => console.error("에러 발생:", err))

    alert("업로드 완료!");
  };

  return (
    <div>
      <h2>주방가전 요리책 업로드</h2>
      <form onSubmit={handleSubmit}>

        <input name="applianceType" placeholder="가전종류" onChange={handleChange} />
        <input name="manufacturer" placeholder="제조사" onChange={handleChange} />
        <input name="productName" placeholder="제품명" onChange={handleChange} />
        <input name="totalPages" placeholder="총 페이지수" type="number" onChange={handleChange} />

        <input type="file" onChange={e => setFile(e.target.files[0])} />

        <button type="submit">업로드</button>
      </form>
    </div>
  );
};

export default AdminUpload;
