export const getStatusBadgeVariant = (isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
  return isActive ? "default" : "destructive";
};
