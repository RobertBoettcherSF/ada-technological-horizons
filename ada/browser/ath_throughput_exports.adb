with Ath_Throughput;

package body Ath_Throughput_Exports is
   use type Ath_Throughput.Status_Code;

   Stored_Time      : Long_Float := 0.0;
   Stored_Total     : Long_Float := 0.0;
   Stored_Quantity  : Long_Float := 0.0;
   Stored_Rate      : Long_Float := 0.0;
   Stored_Human     : Long_Float := 0.0;
   Stored_Bacterial : Long_Float := 0.0;
   Stored_Ratio     : Long_Float := 0.0;
   Stored_Time_Valid : Boolean := False;
   Stored_Total_Valid : Boolean := False;
   Stored_Chart_Valid : Boolean := False;
   Stored_Time_Upper : Boolean := False;
   Stored_Total_Lower : Boolean := False;
   Stored_Bound : Long_Float := 0.0;
   Stored_Mode : Interfaces.Integer_32 := Ath_Throughput.Mode_Historical;
   Stored_Match : Interfaces.Integer_32 := 0;
   Stored_Over_Human : Long_Float := 0.0;
   Stored_Over_Bacterial : Long_Float := 0.0;
   Stored_Ratio_Valid : Boolean := False;
   Stored_Linear_Count : Interfaces.Integer_32 := 0;
   Stored_Log_Count : Interfaces.Integer_32 := 0;
   Stored_Linear : Ath_Throughput.Comparison_Table;
   Stored_Log : Ath_Throughput.Comparison_Table;

   function Flag (Value : Boolean) return Interfaces.Integer_32 is
   begin
      if Value then
         return 1;
      end if;
      return 0;
   end Flag;

   procedure Clear is
   begin
      Stored_Time := 0.0;
      Stored_Total := 0.0;
      Stored_Quantity := 0.0;
      Stored_Rate := 0.0;
      Stored_Human := 0.0;
      Stored_Bacterial := 0.0;
      Stored_Ratio := 0.0;
      Stored_Time_Valid := False;
      Stored_Total_Valid := False;
      Stored_Chart_Valid := False;
      Stored_Time_Upper := False;
      Stored_Total_Lower := False;
      Stored_Bound := 0.0;
      Stored_Match := 0;
      Stored_Over_Human := 0.0;
      Stored_Over_Bacterial := 0.0;
      Stored_Ratio_Valid := False;
      Stored_Linear_Count := 0;
      Stored_Log_Count := 0;
      Stored_Linear := (others => <>);
      Stored_Log := (others => <>);
   end Clear;

   function Ath_Throughput_Set_Mode
     (Mode : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if Mode < Ath_Throughput.Mode_Historical or else Mode > Ath_Throughput.Mode_Custom then
         Stored_Mode := Ath_Throughput.Mode_Custom;
      else
         Stored_Mode := Mode;
      end if;
      if Stored_Chart_Valid then
         Ath_Throughput.Build_Comparison
           (Stored_Rate, Stored_Bound, Stored_Quantity, Stored_Mode,
            Stored_Match, Stored_Over_Human, Stored_Over_Bacterial,
            Stored_Ratio_Valid, Stored_Linear_Count, Stored_Log_Count,
            Stored_Linear, Stored_Log);
      end if;
      return Stored_Mode;
   end Ath_Throughput_Set_Mode;

   function Ath_Throughput_F64
     (Quantity, Quantity_Unit, Rate, Rate_Unit, Bound, Duration, Duration_Unit : Long_Float)
      return Interfaces.Integer_32
   is
      Status : Ath_Throughput.Status_Code;
   begin
      Ath_Throughput.Convey
        (Quantity, Quantity_Unit, Rate, Rate_Unit, Bound, Duration, Duration_Unit,
         Stored_Time, Stored_Total, Stored_Quantity, Stored_Rate,
         Stored_Human, Stored_Bacterial, Stored_Ratio,
         Stored_Time_Valid, Stored_Total_Valid, Stored_Chart_Valid,
         Stored_Time_Upper, Stored_Total_Lower, Status);
      if Status /= Ath_Throughput.Ok
        and then Status /= Ath_Throughput.Unreachable
        and then Status /= Ath_Throughput.Indeterminate
      then
         Clear;
      else
         Stored_Bound := Bound;
         Ath_Throughput.Build_Comparison
           (Stored_Rate, Stored_Bound, Stored_Quantity, Stored_Mode,
            Stored_Match, Stored_Over_Human, Stored_Over_Bacterial,
            Stored_Ratio_Valid, Stored_Linear_Count, Stored_Log_Count,
            Stored_Linear, Stored_Log);
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Throughput_F64;

   function Ath_Throughput_Time_Valid return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Time_Valid);
   end Ath_Throughput_Time_Valid;

   function Ath_Throughput_Time return Long_Float is
   begin
      return Stored_Time;
   end Ath_Throughput_Time;

   function Ath_Throughput_Time_Upper return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Time_Upper);
   end Ath_Throughput_Time_Upper;

   function Ath_Throughput_Total_Valid return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Total_Valid);
   end Ath_Throughput_Total_Valid;

   function Ath_Throughput_Total return Long_Float is
   begin
      return Stored_Total;
   end Ath_Throughput_Total;

   function Ath_Throughput_Total_Lower return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Total_Lower);
   end Ath_Throughput_Total_Lower;

   function Ath_Throughput_Chart_Valid return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Chart_Valid);
   end Ath_Throughput_Chart_Valid;

   function Ath_Throughput_Human return Long_Float is
   begin
      return Stored_Human;
   end Ath_Throughput_Human;

   function Ath_Throughput_Bacterial return Long_Float is
   begin
      return Stored_Bacterial;
   end Ath_Throughput_Bacterial;

   function Ath_Throughput_Ratio return Long_Float is
   begin
      return Stored_Ratio;
   end Ath_Throughput_Ratio;

   function Ath_Throughput_Quantity_Bits return Long_Float is
   begin
      return Stored_Quantity;
   end Ath_Throughput_Quantity_Bits;

   function Ath_Throughput_Rate_Bits return Long_Float is
   begin
      return Stored_Rate;
   end Ath_Throughput_Rate_Bits;

   function Ath_Throughput_Preset_Count return Interfaces.Integer_32 is
   begin
      return Ath_Throughput.Preset_Count;
   end Ath_Throughput_Preset_Count;

   function Known (Index : Interfaces.Integer_32) return Boolean is
   begin
      return Index >= 1 and then Index <= Ath_Throughput.Preset_Count;
   end Known;

   function Ath_Throughput_Preset_Quantity
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Known (Index) then
         return 0.0;
      end if;
      return Ath_Throughput.Preset_Quantity (Integer (Index));
   end Ath_Throughput_Preset_Quantity;

   function Ath_Throughput_Preset_Quantity_Unit
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Known (Index) then
         return -1.0;
      end if;
      return Ath_Throughput.Preset_Quantity_Unit (Integer (Index));
   end Ath_Throughput_Preset_Quantity_Unit;

   function Ath_Throughput_Preset_Rate
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Known (Index) then
         return 0.0;
      end if;
      return Ath_Throughput.Preset_Rate (Integer (Index));
   end Ath_Throughput_Preset_Rate;

   function Ath_Throughput_Preset_Rate_Unit
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Known (Index) then
         return -1.0;
      end if;
      return Ath_Throughput.Preset_Rate_Unit (Integer (Index));
   end Ath_Throughput_Preset_Rate_Unit;

   function Ath_Throughput_Preset_Bound
     (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if not Known (Index) then
         return -1.0;
      end if;
      return Ath_Throughput.Preset_Bound (Integer (Index));
   end Ath_Throughput_Preset_Bound;

   function Ath_Throughput_Preset_Sets_Quantity
     (Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if Known (Index) and then Ath_Throughput.Preset_Sets_Quantity (Integer (Index)) then
         return 1;
      end if;
      return 0;
   end Ath_Throughput_Preset_Sets_Quantity;

   function Ath_Throughput_Preset_Sets_Rate
     (Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if Known (Index) and then Ath_Throughput.Preset_Sets_Rate (Integer (Index)) then
         return 1;
      end if;
      return 0;
   end Ath_Throughput_Preset_Sets_Rate;

   function Ath_Throughput_Human_Rate return Long_Float is
   begin
      return Ath_Throughput.Human_Bits_Per_Second;
   end Ath_Throughput_Human_Rate;

   function Ath_Throughput_Bacterial_Rate return Long_Float is
   begin
      return Ath_Throughput.Bacterial_Bits_Per_Second;
   end Ath_Throughput_Bacterial_Rate;

   function Ath_Throughput_Link_Rate return Long_Float is
   begin
      return Ath_Throughput.Link_Bits_Per_Second;
   end Ath_Throughput_Link_Rate;

   function Ath_Throughput_Human_Linear return Long_Float is
   begin
      return Ath_Throughput.Linear_Share (Ath_Throughput.Human_Bits_Per_Second);
   end Ath_Throughput_Human_Linear;

   function Ath_Throughput_Bacterial_Linear return Long_Float is
   begin
      return Ath_Throughput.Linear_Share (Ath_Throughput.Bacterial_Bits_Per_Second);
   end Ath_Throughput_Bacterial_Linear;

   function Ath_Throughput_Human_Log return Long_Float is
   begin
      return Ath_Throughput.Logarithmic_Share (Ath_Throughput.Human_Bits_Per_Second);
   end Ath_Throughput_Human_Log;

   function Ath_Throughput_Bacterial_Log return Long_Float is
   begin
      return Ath_Throughput.Logarithmic_Share (Ath_Throughput.Bacterial_Bits_Per_Second);
   end Ath_Throughput_Bacterial_Log;

   function Ath_Throughput_Link_Log return Long_Float is
   begin
      return Ath_Throughput.Logarithmic_Share (Ath_Throughput.Link_Bits_Per_Second);
   end Ath_Throughput_Link_Log;

   function Ath_Throughput_Link_Time return Long_Float is
      Seconds : Long_Float;
      Valid   : Boolean;
   begin
      if not Stored_Chart_Valid then
         return 0.0;
      end if;
      Ath_Throughput.Reference_Seconds
        (Stored_Quantity, Ath_Throughput.Link_Bits_Per_Second, Seconds, Valid);
      if not Valid then
         return 0.0;
      end if;
      return Seconds;
   end Ath_Throughput_Link_Time;

   function Ath_Throughput_Link_Valid return Interfaces.Integer_32 is
      Seconds : Long_Float;
      Valid   : Boolean;
   begin
      if not Stored_Chart_Valid then
         return 0;
      end if;
      Ath_Throughput.Reference_Seconds
        (Stored_Quantity, Ath_Throughput.Link_Bits_Per_Second, Seconds, Valid);
      return Flag (Valid);
   end Ath_Throughput_Link_Valid;

   function Ath_Throughput_Match return Interfaces.Integer_32 is
   begin
      return Stored_Match;
   end Ath_Throughput_Match;

   function Ath_Throughput_Over_Human return Long_Float is
   begin
      return Stored_Over_Human;
   end Ath_Throughput_Over_Human;

   function Ath_Throughput_Over_Bacterial return Long_Float is
   begin
      return Stored_Over_Bacterial;
   end Ath_Throughput_Over_Bacterial;

   function Ath_Throughput_Ratio_Valid return Interfaces.Integer_32 is
   begin
      return Flag (Stored_Ratio_Valid);
   end Ath_Throughput_Ratio_Valid;

   function Ath_Throughput_Linear_Count return Interfaces.Integer_32 is
   begin
      return Stored_Linear_Count;
   end Ath_Throughput_Linear_Count;

   function Ath_Throughput_Log_Count return Interfaces.Integer_32 is
   begin
      return Stored_Log_Count;
   end Ath_Throughput_Log_Count;

   function Row
     (Which, Index : Interfaces.Integer_32) return Ath_Throughput.Comparison_Row is
      Empty : Ath_Throughput.Comparison_Row;
   begin
      if Index < 1 then
         return Empty;
      elsif Which = 0 and then Index <= Stored_Linear_Count then
         return Stored_Linear (Integer (Index));
      elsif Which = 1 and then Index <= Stored_Log_Count then
         return Stored_Log (Integer (Index));
      end if;
      return Empty;
   end Row;

   function Ath_Throughput_Row_Kind
     (Which, Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      return Row (Which, Index).Kind;
   end Ath_Throughput_Row_Kind;

   function Ath_Throughput_Row_Rate
     (Which, Index : Interfaces.Integer_32) return Long_Float is
   begin
      return Row (Which, Index).Rate;
   end Ath_Throughput_Row_Rate;

   function Ath_Throughput_Row_Seconds
     (Which, Index : Interfaces.Integer_32) return Long_Float is
   begin
      return Row (Which, Index).Seconds;
   end Ath_Throughput_Row_Seconds;

   function Ath_Throughput_Row_Share
     (Which, Index : Interfaces.Integer_32) return Long_Float is
      Item : constant Ath_Throughput.Comparison_Row := Row (Which, Index);
   begin
      if Which = 1 then
         return Item.Logarithmic;
      end if;
      return Item.Linear;
   end Ath_Throughput_Row_Share;

   function Ath_Throughput_Row_Lower
     (Which, Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      return Flag (Row (Which, Index).Lower);
   end Ath_Throughput_Row_Lower;

   function Ath_Throughput_Row_Time_Valid
     (Which, Index : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      return Flag (Row (Which, Index).Time_Valid);
   end Ath_Throughput_Row_Time_Valid;
end Ath_Throughput_Exports;
