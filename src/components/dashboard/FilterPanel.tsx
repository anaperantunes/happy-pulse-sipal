import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface FilterPanelProps {
  selectedUnit: string;
  onUnitChange: (unit: string) => void;
}

export function FilterPanel({ selectedUnit, onUnitChange }: FilterPanelProps) {
  return (
    <Card className="shadow-sm border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Filtros</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unit-filter" className="text-sm font-medium">
              Unidade
            </Label>
            <Select value={selectedUnit} onValueChange={onUnitChange}>
              <SelectTrigger id="unit-filter">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                <SelectItem value="Matriz">Matriz</SelectItem>
                <SelectItem value="Filial">Filial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
