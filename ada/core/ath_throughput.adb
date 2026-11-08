with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;

package body Ath_Throughput is
   use type Status_Code;

   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   procedure Clear
     (Time_Seconds      : out Long_Float;
      Total_Bits        : out Long_Float;
      Quantity_Bits     : out Long_Float;
      Rate_Bits         : out Long_Float;
      Human_Seconds     : out Long_Float;
      Bacterial_Seconds : out Long_Float;
      Rate_Ratio        : out Long_Float;
      Time_Valid        : out Boolean;
      Total_Valid       : out Boolean;
      Chart_Valid       : out Boolean;
      Time_Is_Upper     : out Boolean;
      Total_Is_Lower    : out Boolean) is
   begin
      Time_Seconds := 0.0;
      Total_Bits := 0.0;
      Quantity_Bits := 0.0;
      Rate_Bits := 0.0;
      Human_Seconds := 0.0;
      Bacterial_Seconds := 0.0;
      Rate_Ratio := 0.0;
      Time_Valid := False;
      Total_Valid := False;
      Chart_Valid := False;
      Time_Is_Upper := False;
      Total_Is_Lower := False;
   end Clear;

   function Quantity_Scale (Unit : Long_Float) return Long_Float is
   begin
      if Unit = Unit_Bits then
         return 1.0;
      elsif Unit = Unit_Kilobits then
         return 1_000.0;
      elsif Unit = Unit_Pages then
         return Page_Bits;
      else
         return -1.0;
      end if;
   end Quantity_Scale;

   function Rate_Scale (Unit : Long_Float) return Long_Float is
   begin
      if Unit = Rate_Bits_Per_Second then
         return 1.0;
      elsif Unit = Rate_Bits_Per_Minute then
         return 1.0 / 60.0;
      elsif Unit = Rate_Kilobits_Per_Second then
         return 1_000.0;
      elsif Unit = Rate_Gigabits_Per_Second then
         return Link_Bits_Per_Second;
      else
         return -1.0;
      end if;
   end Rate_Scale;

   function Duration_Scale (Unit : Long_Float) return Long_Float is
   begin
      if Unit = Duration_Seconds then
         return 1.0;
      elsif Unit = Duration_Minutes then
         return 60.0;
      elsif Unit = Duration_Hours then
         return 3_600.0;
      else
         return -1.0;
      end if;
   end Duration_Scale;

   procedure Convey
     (Quantity      : Long_Float;
      Quantity_Unit : Long_Float;
      Rate          : Long_Float;
      Rate_Unit     : Long_Float;
      Bound         : Long_Float;
      Duration      : Long_Float;
      Duration_Unit : Long_Float;
      Time_Seconds  : out Long_Float;
      Total_Bits    : out Long_Float;
      Quantity_Bits : out Long_Float;
      Rate_Bits     : out Long_Float;
      Human_Seconds : out Long_Float;
      Bacterial_Seconds : out Long_Float;
      Rate_Ratio    : out Long_Float;
      Time_Valid    : out Boolean;
      Total_Valid   : out Boolean;
      Chart_Valid   : out Boolean;
      Time_Is_Upper : out Boolean;
      Total_Is_Lower : out Boolean;
      Status        : out Status_Code)
   is
      Q_Scale : Long_Float;
      R_Scale : Long_Float;
      D_Scale : Long_Float;
      Seconds : Long_Float;
   begin
      Clear
        (Time_Seconds, Total_Bits, Quantity_Bits, Rate_Bits,
         Human_Seconds, Bacterial_Seconds, Rate_Ratio,
         Time_Valid, Total_Valid, Chart_Valid, Time_Is_Upper, Total_Is_Lower);
      if not Is_Finite (Quantity) or else not Is_Finite (Quantity_Unit)
        or else not Is_Finite (Rate) or else not Is_Finite (Rate_Unit)
        or else not Is_Finite (Bound) or else not Is_Finite (Duration)
        or else not Is_Finite (Duration_Unit)
      then
         Status := Non_Finite_Input;
         return;
      end if;
      if Quantity < 0.0 or else Rate < 0.0 or else Duration < 0.0 then
         Status := Negative;
         return;
      end if;
      if Bound /= Bound_Exact and then Bound /= Bound_Lower then
         Status := Bad_Unit;
         return;
      end if;
      Q_Scale := Quantity_Scale (Quantity_Unit);
      R_Scale := Rate_Scale (Rate_Unit);
      D_Scale := Duration_Scale (Duration_Unit);
      if Q_Scale < 0.0 or else R_Scale < 0.0 or else D_Scale < 0.0 then
         Status := Bad_Unit;
         return;
      end if;

      Quantity_Bits := Quantity * Q_Scale;
      Rate_Bits := Rate * R_Scale;
      Seconds := Duration * D_Scale;
      if not Is_Finite (Quantity_Bits) or else not Is_Finite (Rate_Bits)
        or else not Is_Finite (Seconds)
      then
         Clear
           (Time_Seconds, Total_Bits, Quantity_Bits, Rate_Bits,
            Human_Seconds, Bacterial_Seconds, Rate_Ratio,
            Time_Valid, Total_Valid, Chart_Valid, Time_Is_Upper, Total_Is_Lower);
         Status := Result_Not_Finite;
         return;
      end if;

      Rate_Ratio := Historical_Rate_Ratio;
      if Quantity_Bits = 0.0 then
         Human_Seconds := 0.0;
         Bacterial_Seconds := 0.0;
      else
         Human_Seconds := Quantity_Bits / Human_Bits_Per_Second;
         Bacterial_Seconds := Quantity_Bits / Bacterial_Bits_Per_Second;
      end if;
      if not Is_Finite (Human_Seconds) or else not Is_Finite (Bacterial_Seconds) then
         Clear
           (Time_Seconds, Total_Bits, Quantity_Bits, Rate_Bits,
            Human_Seconds, Bacterial_Seconds, Rate_Ratio,
            Time_Valid, Total_Valid, Chart_Valid, Time_Is_Upper, Total_Is_Lower);
         Status := Result_Not_Finite;
         return;
      end if;
      Chart_Valid := True;

      Total_Bits := Rate_Bits * Seconds;
      if not Is_Finite (Total_Bits) then
         Clear
           (Time_Seconds, Total_Bits, Quantity_Bits, Rate_Bits,
            Human_Seconds, Bacterial_Seconds, Rate_Ratio,
            Time_Valid, Total_Valid, Chart_Valid, Time_Is_Upper, Total_Is_Lower);
         Status := Result_Not_Finite;
         return;
      end if;
      Total_Valid := True;
      Total_Is_Lower := Bound = Bound_Lower and then Rate_Bits > 0.0;

      if Rate_Bits = 0.0 then
         Time_Valid := False;
         Time_Is_Upper := False;
         if Quantity_Bits > 0.0 then
            Status := Unreachable;
         else
            Status := Indeterminate;
         end if;
         return;
      end if;

      Time_Seconds := Quantity_Bits / Rate_Bits;
      if not Is_Finite (Time_Seconds) then
         Clear
           (Time_Seconds, Total_Bits, Quantity_Bits, Rate_Bits,
            Human_Seconds, Bacterial_Seconds, Rate_Ratio,
            Time_Valid, Total_Valid, Chart_Valid, Time_Is_Upper, Total_Is_Lower);
         Status := Result_Not_Finite;
         return;
      end if;
      Time_Valid := True;
      Time_Is_Upper := Bound = Bound_Lower;
      Status := Ok;
   end Convey;

   function Preset_Quantity (Index : Preset_Index) return Long_Float is
   begin
      if Index = 1 then
         return 1.0;
      end if;
      return 0.0;
   end Preset_Quantity;

   function Preset_Quantity_Unit (Index : Preset_Index) return Long_Float is
   begin
      if Index = 1 then
         return Unit_Pages;
      end if;
      return Unit_Bits;
   end Preset_Quantity_Unit;

   function Preset_Rate (Index : Preset_Index) return Long_Float is
   begin
      if Index = 2 then
         return Human_Bits_Per_Second;
      elsif Index = 3 then
         return Bacterial_Bits_Per_Second;
      elsif Index = 4 then
         return 1.0;
      end if;
      return 0.0;
   end Preset_Rate;

   function Preset_Rate_Unit (Index : Preset_Index) return Long_Float is
   begin
      if Index = 4 then
         return Rate_Gigabits_Per_Second;
      end if;
      return Rate_Bits_Per_Second;
   end Preset_Rate_Unit;

   function Preset_Bound (Index : Preset_Index) return Long_Float is
   begin
      if Index = 3 then
         return Bound_Lower;
      end if;
      return Bound_Exact;
   end Preset_Bound;

   function Preset_Sets_Quantity (Index : Preset_Index) return Boolean is
   begin
      return Index = 1;
   end Preset_Sets_Quantity;

   function Preset_Sets_Rate (Index : Preset_Index) return Boolean is
   begin
      return Index = 2 or else Index = 3 or else Index = 4;
   end Preset_Sets_Rate;

   function Linear_Share (Rate : Long_Float) return Long_Float is
   begin
      return Rate / Bacterial_Bits_Per_Second;
   end Linear_Share;

   function Logarithmic_Share (Rate : Long_Float) return Long_Float is
   begin
      return Ada.Numerics.Long_Elementary_Functions.Log (Rate)
        / Ada.Numerics.Long_Elementary_Functions.Log (Link_Bits_Per_Second);
   end Logarithmic_Share;

   procedure Reference_Seconds
     (Quantity_Bits : Long_Float;
      Rate          : Long_Float;
      Seconds       : out Long_Float;
      Valid         : out Boolean) is
   begin
      Seconds := 0.0;
      Valid := False;
      if not Is_Finite (Quantity_Bits) or else not Is_Finite (Rate) or else Rate <= 0.0
        or else Quantity_Bits < 0.0
      then
         return;
      end if;
      Seconds := Quantity_Bits / Rate;
      Valid := Is_Finite (Seconds);
      if not Valid then
         Seconds := 0.0;
      end if;
   end Reference_Seconds;
end Ath_Throughput;
