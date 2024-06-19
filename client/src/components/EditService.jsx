import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import SyncLoader from 'react-spinners/SyncLoader';

const EditServiceContainer = styled.div`
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
  background-color: #ffffff;
  color: #000;
  font-size: 0.9rem;
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
  margin-bottom: 16px;

  & > input {
    flex: 1;
    margin-right: 8px;
  }
`;

const AddAndRemoveButton = styled.button`
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

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    category: '',
    date_times: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:1000/api/beauty/services/${id}`);
        const service = response.data;
        const scheduleResponse = await axios.get(`http://localhost:1000/api/beauty/services/${id}/schedule`);
        const schedule = scheduleResponse.data.map((s) => s.date_time);

        setFormData({
          title: service.title,
          image: service.image,
          category: service.category,
          date_times: schedule,
        });
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

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
      newErrors.title = 'Title is required.';
    } else if (formData.title.length < 2 || formData.title.length > 50) {
      valid = false;
      newErrors.title = 'Title must be between 2 and 50 characters long.';
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
      return;
    }

    setLoading(true);

    try {
      await axios.patch(`http://localhost:1000/api/beauty/services/${id}`, {
        title: formData.title,
        image: formData.image,
        category: formData.category,
      });

      await axios.patch(`http://localhost:1000/api/beauty/services/${id}/schedule`, {
        date_times: formData.date_times,
      });

      navigate(`/services/${id}`);
    } catch (error) {
      setErrors({ api: 'Error updating service: ' + error.message });
      console.error('Error updating service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EditServiceContainer>
      <FormTitle>Edit Service</FormTitle>
      <StyledForm onSubmit={handleSubmit}>
        <FormField>
          <Label htmlFor="name">Title:</Label>
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
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
           <option value="Hair">Hair</option>
            <option value="Nails">Nails</option>
            <option value="Face">Face</option>
          </TypeSelect>
        </FormField>
        {formData.date_times &&
          formData.date_times.map((date_time, index) => (
            <FormField key={index}>
              <Label htmlFor={`date_time_${index}`}>Date and time:</Label>
              <DateTimeField>
                <Input
                  type="datetime-local"
                  id={`date_time_${index}`}
                  name={`date_time_${index}`}
                  value={date_time}
                  onChange={(e) => handleChange(e, index)}
                  required
                />
                {errors[`date_time_${index}`] && <ErrorMessage>{errors[`date_time_${index}`]}</ErrorMessage>}
                <AddAndRemoveButton type="button" onClick={() => removeDateTime(index)}>
                  Remove
                </AddAndRemoveButton>
              </DateTimeField>
            </FormField>
          ))}
        <FormField>
          <AddAndRemoveButton type="button" onClick={addDateTime}>
            Add Date and Time
          </AddAndRemoveButton>
        </FormField>
        
        {errors.api && <ErrorMessage>{errors.api}</ErrorMessage>}
        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <LoadingContainer>
              <SyncLoader size={8} color={'#000000'} />
            </LoadingContainer>
          ) : (
            'Update Service'
          )}
        </SubmitButton>
      </StyledForm>
    </EditServiceContainer>
  );
};

export default EditService;
