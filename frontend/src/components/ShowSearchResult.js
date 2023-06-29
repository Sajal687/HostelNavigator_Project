import React, { useEffect, useState } from "react";
import SearchHostel from "./SearchHostel";
import axios from "axios";
import { BASE_URL } from "../services/helper";

const ShowSearchResult = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(`${BASE_URL}/hostels`);
      // console.log(response.data.data[0].hostel_address.city);
      const hostelName = response.data.data.map((val, index) => {
        return val.hostel_name;
      });
      setData(hostelName);
    }
    fetchData();
  }, []);

  const filterData = (query, data) => {
    if (!query) {
      return data;
    } else {
      return data.filter((d) => d.toLowerCase().includes(query.toLowerCase()));
    }
  };

  const dataFiltered = filterData(searchQuery, data);

  return (
    <div
      style={{
        display: "flex",
        alignSelf: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: 20,
      }}
    >
      <SearchHostel searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div style={{ padding: 3 }}>
        {dataFiltered.map((d) => (
          <div
            className="text"
            style={{
              padding: 5,
              justifyContent: "normal",
              fontSize: 20,
              color: "blue",
              margin: 1,
              width: "250px",
              BorderColor: "green",
              borderWidth: "10px",
            }}
            key={d.id}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowSearchResult;
