import React, { useEffect, useState } from "react";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const Customers = () => {

  const [customers, setCustomers] = useState([]);
  const [search,setSearch] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    address: ""
  });
  const navigate = useNavigate();
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {

      const res = await api.get("/customers");

      setCustomers(res.data);

    } catch (err) {

      console.log(err);

    }
  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const addCustomer = async (e) => {

    e.preventDefault();

    try {

      await api.post(
        "/customers",
        form
      );

      setForm({
        full_name: "",
        mobile: "",
        email: "",
        address: ""
      });

      fetchCustomers();

    } catch (err) {

      console.log(err);

    }
  };

  const deleteCustomer = async (id) => {

    if (!window.confirm(
      "Delete customer?"
    )) return;

    try {

      await api.delete(
        `/customers/${id}`
      );

      fetchCustomers();

    } catch (err) {

      console.log(err);

    }
  };

  return (

    <DashboardLayout>

      <h1 className="page-title">
        Customers
      </h1>
      <div className="stat-card">

  <h3>
    Search Customer
  </h3>

  <br />

  <input
    type="text"
    placeholder="Search Mobile Number"
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
  />

</div>
      <div className="stat-card">

        <h3>
          Add Customer
        </h3>

        <br />

        <form
          onSubmit={addCustomer}
        >

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
          />

          <br /><br />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile"
            value={form.mobile}
            onChange={handleChange}
          />

          <br /><br />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <br /><br />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />

          <br /><br />

          <button
            type="submit"
          >
            Add Customer
          </button>

        </form>

      </div>

      <br />

      <div className="table-container">

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Name</th>

              <th>Mobile</th>

              <th>Email</th>

              <th>Bookings</th>

              <th>Spend</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

{
  customers
    .filter((c) =>
      c.mobile
        ?.toString()
        .includes(search)
    )
    .map((c) => (

      <tr key={c.customer_id}>

        <td>{c.customer_id}</td>

        <td>{c.full_name}</td>

        <td>{c.mobile}</td>

        <td>{c.email}</td>

        <td>{c.total_bookings}</td>

        <td>
          $
          {Number(
            c.total_spend || 0
          ).toFixed(2)}
        </td>

        <td>

          <button
  onClick={() =>
    navigate(
      `/customers/${c.customer_id}`
    )
  }
>
  Profile
</button>

          <button
            onClick={() =>
              deleteCustomer(
                c.customer_id
              )
            }
          >
            Delete
          </button>

        </td>

      </tr>

    ))
}

</tbody>

        </table>

      </div>

    </DashboardLayout>

  );
};

export default Customers;