import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SyncLoader from 'react-spinners/SyncLoader';

const RegistrationContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 0 auto;
  align-items: center;
  width: 100%;
  max-width: 700px;
  line-height: 36px;
  font-size: 20px;
  color: #666666;
  padding: 50px 30px;
`;

const FormTitle = styled.p`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FormField = styled.div`
  font-size: 16px;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 16px;
`;

const Label = styled.label`
  height: 24px;
  margin-bottom: 7px;
  font-size: 1rem;
`;

const Input = styled.input`
  height: 40px;
  padding: 5px;
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 4px;
  outline: none;
  color: #333333;
  font-size: 1rem;

  &:focus {
    border-color: #000;
    outline: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 45px;
  padding: 10px;
  color: #000;
  font-size: 0.9rem;
  background-color: #fff;
  border: 1px solid #000000;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;

  &:hover {
    background-color: #dddddd;
    color: #000000;
    border: 1px solid #dddddd;
    transform: scale(1.05);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const TypeSelect = styled.select`
  height: 40px;
  padding: 5px;
  border: 1px solid rgba(221, 221, 221, 1);
  border-radius: 4px;
  outline: none;
  color: #333333;
  font-size: 16px;
  &:focus {
    border-color: #000;
    outline: none;
  }
`;

const DateTimeField = styled.div`
  display: flex;
  align-items: center;

  & > input {
    flex: 1;
  }
`;

const AddandRemoveButton = styled.button`
  height: 40px;
  padding: 0 10px;
  background-color: #ffffff;
  color: #000;
  border: 1px solid #dddddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #dddddd;
  }
`;

const ErrorMessage = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  color: #990000;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`;

const CreateService = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    category: '',
    date_times: [''],
  });

  const handleChange = (e, index) => {
    const newDateTimes = [...formData.date_times];
    newDateTimes[index] = e.target.value;
    setFormData({
      ...formData,
      date_times: newDateTimes,
    });
  };

  const addDateTime = () => {
    setFormData({
      ...formData,
      date_times: [...formData.date_times, ''],
    });
  };

  const removeDateTime = (index) => {
    const newDateTimes = [...formData.date_times];
    newDateTimes.splice(index, 1);
    setFormData({
      ...formData,
      date_times: newDateTimes,
    });
  };

  // Validacija
  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.title) {
      valid = false;
      newErrors.title = 'Name is required.';
    } else if (formData.title.length < 2 || formData.title.length > 50) {
      valid = false;
      newErrors.title = 'Name must be between 2 and 50 characters long.';
    }

    if (!formData.image) {
      valid = false;
      newErrors.image = 'Image URL is required.';
    }


    formData.date_times.forEach((date_time, index) => {
      if (!date_time) {
        valid = false;
        newErrors[`date_time_${index}`] = 'Date and time is required.';
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Do not proceed if the form is invalid
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:1000/api/beauty/services', {
        title: formData.title,
        image: formData.image,
        category: formData.category,
      });
      const serviceId = response.data.id;

      // Pridedame kiekviena data ir laika
      for (const date_time of formData.date_times) {
        await axios.post(`http://localhost:1000/api/beauty/schedule/${serviceId}/addTimeSlot`, {
          service_id: serviceId,
          date_time,
        });
      }

      const newService = response.data;

      const storedServices = JSON.parse(sessionStorage.getItem('services')) || [];

      const updatedServices = [...storedServices, newService];

      sessionStorage.setItem('beauty', JSON.stringify(updatedServices));

      navigate('/services');
    } catch (error) {
      setErrors({ api: 'Error creating service: ' + error.message });
      console.error('Error creating service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationContainer>
      <FormTitle>Create Beauty Service</FormTitle>
      <StyledForm onSubmit={handleSubmit}>
        <FormField>
          <Label htmlFor="name">Name:</Label>
          <Input
            type="text"
            id="name"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            minLength={2}
            maxLength={50}
            required
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormField>
        <FormField>
          <Label htmlFor="image">Image URL:</Label>
          <Input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            required
          />
          {errors.image && <ErrorMessage>{errors.image}</ErrorMessage>}
        </FormField>
        <FormField>
          <Label htmlFor="category">Category:</Label>
          <TypeSelect
            id="category"
            name="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Hair">Hair</option>
            <option value="Nails">Nails</option>
            <option value="Face">Face</option>
          </TypeSelect>
        </FormField>
        {formData.date_times.map((date_time, index) => (
          <FormField key={index}>
            <Label>Date and time:</Label>
            <DateTimeField>
              <Input
                type="datetime-local"
                id={`date_time_${index}`}
                name={`date_time_${index}`}
                value={date_time}
                onChange={(e) => handleChange(e, index)}
                required
              />
              {errors[`date_time_${index}`] && <ErrorMessage>{errors[`date_time{index}`]}</ErrorMessage>}
              <AddandRemoveButton type="button" onClick={() => removeDateTime(index)}>
                Remove
              </AddandRemoveButton>
            </DateTimeField>
          </FormField>
        ))}
        <FormField>
          <AddandRemoveButton type="button" onClick={addDateTime}>
            Add Date and Time
          </AddandRemoveButton>
        </FormField>
      
        {errors.api && <ErrorMessage>{errors.api}</ErrorMessage>}
        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <LoadingContainer>
              <SyncLoader size={8} color={'#ffffff'} />
            </LoadingContainer>
          ) : (
            'Create Beauty Service'
          )}
        </SubmitButton>
      </StyledForm>
    </RegistrationContainer>
  );
};

export default CreateService;
