/* eslint-disable no-unused-vars */

import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import ImageUpload from "./ImageUpload";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthUserContext } from "../App";
import {BASE_URL} from '../services/helper';
import {
  Grid,
  Box,
  TextField,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormGroup,
  Checkbox,
  RadioGroup,
  Radio,
  Select,
  Chip,
  Stack,
  MenuItem,
  Slider,
  InputLabel,
  Button,
  OutlinedInput,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

const roomCapacity = [
  { id: "single", label: "Single" },
  { id: "double", label: "Double" },
  { id: "triple", label: "Triple" },
  { id: "multi-sharing", label: "Multi-Sharing" },
];

const facilities = [
  "Table",
  "Chair",
  "Bed (without mattress)",
  "Book Rack",
  "Almirah",
  "Kitchen",
  "Separate Bathroom",
  "Library",
  "Laundry",
  "24/7 Electricity",
  "Water Supply",
  "Dining Hall",
];

const ITEM_HEIGHT = 45;
const ITEM_PADDING_TOP = 5;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const CreateNewHostel = () => {
  const methods = useForm();
  const [envVariable, setEnvVariable] = useState(null);
  const [addressDetail, setAddressDetail] = useState([]);
  const [cityNameVisible, setCityNameVisible] = useState(false);
  const [stateNameVisible, setStateNameVisible] = useState(false);
  const [selectedRoomCapacity, setSelectedRoomCapacity] = useState([]);

 
  const { loggedIn, setLoggedIn } = useContext(AuthUserContext);

  const location = useLocation();
  const navigate = useNavigate();
  const { firstName, lastName, ownerEmail, ownerPhnNumber, password } =
    location.state;

  useEffect(() => {
    const fetchEnvrionmentVariable = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api`);
        console.log(response.data.data)
        setEnvVariable(response.data.data);
      } catch (error) {
        console.error("Error fetching environment variables:", error);
      }
    };
    fetchEnvrionmentVariable();
  }, []);

  const handleRoomCapacityToggle = (roomId) => {
    setSelectedRoomCapacity((prevSelectedRoomCapacity) => {
      if (prevSelectedRoomCapacity.includes(roomId)) {
        return prevSelectedRoomCapacity.filter((id) => id !== roomId);
      } else {
        return [...prevSelectedRoomCapacity, roomId];
      }
    });
  };

  const handlePostalCodeChange = async (e) => {
    const codeValue = e.target.value;

    if (codeValue.length === 6) {
      const options = {
        method: "POST",
        url: "https://get-details-by-pin-code-india.p.rapidapi.com/detailsbypincode",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": envVariable,
          "X-RapidAPI-Host": "get-details-by-pin-code-india.p.rapidapi.com",
        },
        data: { pincode: codeValue },
      };

      try {
        const response = await axios.request(options);
        setAddressDetail(response.data.details);
        setCityNameVisible(true);
        setStateNameVisible(true);
      } catch (error) {
        // console.error(error);
        setCityNameVisible(false);
        setStateNameVisible(false);
      }
    }
  };

  const handleSubmit = methods.handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("hostel_name", data.hostelName);
    formData.append("hostel_gender_type", data.allowGender);
    formData.append("hostel_rent", data.hostelRent);
    formData.append("owner_name", `${firstName} ${lastName}`);
    formData.append("owner_phone_number", ownerPhnNumber);
    formData.append("owner_email", ownerEmail);
    formData.append("password", password);

    data.hostelFacilities.forEach((facility) => {
      formData.append("hostel_facilities", facility);
    });

    const { pincode, city_name, state_name } = addressDetail[0];

    console.log(pincode, city_name, state_name);

    const hostelAddress = {
      street: data.street,
      city: city_name,
      state: state_name,
      postal_code: pincode,
    };
    data.hostelAddress = hostelAddress;
    formData.append("hostel_address", JSON.stringify(data.hostelAddress));

    const roomDetail = {
      room_number: data.numberOfRooms,
      room_capacity: selectedRoomCapacity,
    };
    data.roomDetail = roomDetail;
    formData.append("hostel_rooms", JSON.stringify(data.roomDetail));

    data.hostelImage.forEach((image) => {
      formData.append("hostel_images", image);
    });

    try {
      const response = await axios.post(
        `${BASE_URL}/hostels`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        methods.reset();
        toast.success(
          "Hooray! Your hostel details have been saved and are now available for booking."
        );
        localStorage.setItem("token", response.data.token);
        setLoggedIn(true);
        navigate("/ownerdashboard");
      } else {
        toast.error(
          "Oh no! Something went wrong while saving your hostel details. Please double-check your information and attempt to submit again."
        );
        navigate("/registerowner");
      }
    } catch (err) {
      // console.log(err);
    }
  });

  return (
    <FormProvider {...methods}>
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Grid
          container
          spacing={2}
          mt={2}
          px={2}
          sx={{ justifyContent: "center" }}
        >
          <Grid item xs={12} sm={3}>
            <InputLabel
              sx={{
                display: "flex",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              Hostel Name :
            </InputLabel>
          </Grid>
          <Grid item xs={10} sm={8}>
            <TextField
              required
              id="hostelName"
              name="hostelName"
              label="Hostel Name"
              fullWidth
              size="small"
              autoComplete="off"
              variant="outlined"
              {...methods.register("hostelName")}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <InputLabel
              sx={{
                display: "flex",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              Hostel Address :
            </InputLabel>
          </Grid>
          <Grid item xs={10} sm={4} lg={4} md={4}>
            <TextField
              fullWidth
              label="Street"
              {...methods.register("street")}
            />
          </Grid>

          <Grid item xs={10} sm={4} lg={4} md={4}>
            <TextField
              fullWidth
              label="Postal Code"
              onChange={(e) => {
                handlePostalCodeChange(e);
              }}
            />
          </Grid>

          {cityNameVisible && <Grid xs={12} sm={3}></Grid>}

          {cityNameVisible && (
            <>
              <Grid item xs={10} sm={4} lg={4} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={
                    addressDetail && addressDetail.length > 0
                      ? addressDetail[0].city_name
                      : ""
                  }
                />
              </Grid>
            </>
          )}

          {stateNameVisible && (
            <>
              <Grid item xs={10} sm={4} lg={4} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={
                    addressDetail && addressDetail.length > 0
                      ? addressDetail[0].state_name
                      : ""
                  }
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={3}>
            <InputLabel
              sx={{
                display: "flex",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              Allowed Gender :
            </InputLabel>
          </Grid>
          <Grid item xs={12} sm={8}>
            <FormControl>
              <Controller
                name="allowGender"
                control={methods.control}
                defaultValue=""
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    <FormControlLabel
                      key="Boys"
                      value="Boys"
                      control={<Radio size="small" />}
                      label="Boys"
                    />
                    <FormControlLabel
                      key="Girls"
                      value="Girls"
                      control={<Radio size="small" />}
                      label="Girls"
                    />
                    <FormControlLabel
                      key="Both"
                      value="Both"
                      control={<Radio size="small" />}
                      label="Both"
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Grid>


          <Grid item xs={12} sm={3}>
            <InputLabel
              sx={{
                display: "flex",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              Rent: {methods.watch("hostelRent")}
            </InputLabel>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Slider
              value={methods.watch("hostelRent") || 0}
              placeholder="Hostel Rent"
              onChange={(e) => methods.setValue("hostelRent", e.target.value)}
              defaultValue={500}
              step={500}
              min={500}
              max={5000}
              marks={[
                { value: 500, label: "500" },
                { value: 1000, label: "1000" },
                { value: 1500, label: "1500" },
                { value: 2000, label: "2000" },
                { value: 2500, label: "2500" },
                { value: 3000, label: "3000" },
                { value: 3500, label: "3500" },
                { value: 4000, label: "4000" },
                { value: 4500, label: "4500" },
                { value: 5000, label: "5000" },
              ]}
              valueLabelDisplay="auto"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <InputLabel
              id="multipleOptions"
              sx={{
                display: "flex",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              Hostel Facilities :
            </InputLabel>
          </Grid>
          <Grid item xs={12} sm={8}>
            <FormControl sx={{ m: 1, width: 600 }}>
              <InputLabel id="multipleOptions">Hostel Facilities</InputLabel>
              <Controller
                name="hostelFacilities"
                control={methods.control}
                defaultValue={[]}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    labelId="multipleOptions"
                    input={<OutlinedInput label="Hostel Facilities" />}
                    renderValue={(selected) => (
                      <Stack gap={1} direction="row" flexWrap="wrap">
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            onDelete={() => {
                              const facilities = field.value;
                              const filteredFacilities = facilities.filter(
                                (item) => item !== value
                              );
                              field.onChange(filteredFacilities);
                            }}
                            deleteIcon={
                              <CancelIcon
                                onMouseDown={(event) => event.stopPropagation()}
                              />
                            }
                          />
                        ))}
                      </Stack>
                    )}
                    MenuProps={MenuProps}
                  >
                    {facilities.map((facility) => (
                      <MenuItem key={facility} value={facility}>
                        {facility}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <InputLabel
              sx={{
                display: "flex",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              Room Details
            </InputLabel>
          </Grid>
          <Grid items sm={10} sx={{ textAlign: "center" }} py={2}>
            <FormControl sx={{ width: 600 }}>
              <TextField
                label="Total Number of Rooms"
                {...methods.register("numberOfRooms")}
              />
              <FormGroup>
                <FormLabel
                  component="legend"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "left",
                    paddingTop: "10px",
                  }}
                >
                  Room Capacity :
                </FormLabel>
                {roomCapacity.map((roomCapacity) => (
                  <FormControlLabel
                    key={roomCapacity.id}
                    control={
                      <Checkbox
                        checked={selectedRoomCapacity.includes(roomCapacity.id)}
                        onChange={() =>
                          handleRoomCapacityToggle(roomCapacity.id)
                        }
                      />
                    }
                    label={roomCapacity.label}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <InputLabel
              sx={{
                display: "flex",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              Hostel Images :
            </InputLabel>
          </Grid>
          <Grid item xs={12} sm={8}>
            <ImageUpload
              limit={5}
              multiple
              name="hostelImage"
              {...methods.register("hostelImage")}
            />
          </Grid>
          <Grid item xs={12} textAlign="center">
            <Button variant="contained" color="primary" type="submit">
              Submit
            </Button>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};

export default CreateNewHostel;
