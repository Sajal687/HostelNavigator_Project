import axios from "axios";
import React, { useState, useEffect } from "react";
import ImageUpload from "./ImageUpload";
import { FormProvider, useForm, Controller } from "react-hook-form";
import {
  Grid,
  Box,
  TextField,
  FormControlLabel,
  FormControl,
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
import { useTheme } from "@mui/material/styles";

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
  const [message, setMessage] = useState("");

  const handleSubmit = methods.handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("hostel_name", data.hostelName);
    formData.append("hostel_gender_type", data.allowGender);
    formData.append("hostel_rent", data.hostelRent);
    formData.append("owner_name", data.ownerName);
    formData.append("owner_phone_number", data.ownerPhnNumber);
    formData.append("owner_email", data.ownerEmail);

    data.hostelFacilities.forEach((facility) => {
      formData.append("hostel_facilities", facility);
    });

    const hostelAddress = {
      street: data.hostelAddressStreet,
      city: data.hostelAddressCity
    };
    data.hostelAddress = hostelAddress; 
    
    formData.append("hostel_address", JSON.stringify(data.hostelAddress));

    data.hostelImage.forEach((image) => {
      formData.append("hostel_images", image);
    });

    try {
      const response = await axios.post(
        "http://localhost:8080/hostels",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        methods.reset();
        console.log("Hello From Server");
        setMessage("User created successfully");
      } else {
        setMessage("Some error occurred");
      }
    } catch (err) {
      console.log(err);
      setMessage("Some error occurred");
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
        <Grid container spacing={1}>
          <Grid item xs={12} sm={3}>
            <InputLabel
              sx={{
                display: "flex",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              Hostel Name
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
              Hostel Address
            </InputLabel>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Street"
              {...methods.register("hostelAddressStreet")}
            />
           </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              {...methods.register("hostelAddressCity")}
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
              Hostel Owner Name
            </InputLabel>
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              required
              id="ownerName"
              name="ownerName"
              size="small"
              autoComplete="off"
              variant="outlined"
              label="Owner Name"
              {...methods.register("ownerName")}
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
              Owner Email Address
            </InputLabel>
          </Grid>
          <Grid item xs={12} sm={8} lg={2} sx={{ marginRight: "20px" }}>
            <TextField
              fullWidth
              required
              id="ownerEmail"
              name="ownerEmail"
              size="small"
              autoComplete="off"
              variant="outlined"
              label="Owner Email"
              type="email"
              {...methods.register("ownerEmail")}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <InputLabel
              sx={{
                display: "flex",
                justifyContent: "flexStart",
                fontWeight: 700,
              }}
            >
              Owner Phone Number
            </InputLabel>
          </Grid>
          <Grid item xs={12} sm={8} lg={2}>
            <TextField
              fullWidth
              required
              id="ownerPhnNumber"
              name="ownerPhnNumber"
              size="small"
              autoComplete="off"
              variant="outlined"
              label="Owner Phone Number"
              {...methods.register("ownerPhnNumber")}
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
              Allowed Gender
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
              Hostel Facilities
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
              Hostel Images
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
