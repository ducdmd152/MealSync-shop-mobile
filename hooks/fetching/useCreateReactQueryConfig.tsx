import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { APIEntityModel, APIService } from '@/services/api-services/api-service';

const useCreateReactQueryConfig = <Model extends APIEntityModel>(
  keyBaseOfList: any[],
  apiService: APIService<Model>,
  model: Model,
) => {
  const queryClient = useQueryClient();

  const createFunction = async (): Promise<Model> => {
    const response = await apiService.create(model);
    return response.data;
  };

  return useMutation<Model, Error, Model>({
    mutationFn: createFunction,

    onMutate: (newData: Model) => {
      const previousData = queryClient.getQueryData<Model[]>([keyBaseOfList]) || [];

      queryClient.setQueryData<Model[]>([keyBaseOfList], (data = []) => [newData, ...data]);

      return { previousData };
    },

    onSuccess: (savedData, newData) => {
      queryClient.setQueryData<Model[]>([keyBaseOfList], (data) =>
        data?.map((item) => (item === newData ? savedData : item)),
      );
    },

    onError: (error, newData) => {
      queryClient.setQueryData<Model[]>([keyBaseOfList], (data) =>
        data?.filter((item) => item !== newData),
      );
    },
  });
};

export default useCreateReactQueryConfig;
