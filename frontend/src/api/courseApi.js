import $api from './index'

export const getAllDisciplines = () => {
    return $api.get('/discipline')
}

export const getMyDisciplines = (params) => {
    return $api.get('/discipline/my', { params })
}

export const getDiscipline = (id) => {
    return $api.get(`/discipline/${id}`)
}

export const createDiscipline = (data) => {

    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('description', data.description)

    if (data.image) {
        formData.append('image', data.image)
    }

    return $api.post('/discipline', formData)
}

export const updateDiscipline = (id, data) => {

    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('description', data.description)

    if (data.image) {
        formData.append('image', data.image)
    }

    return $api.put(`/discipline/${id}`, formData)
}

export const deleteDiscipline = (id) => {
    return $api.delete(`/discipline/${id}`)
}