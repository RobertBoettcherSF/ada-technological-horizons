with Ada.Numerics.Long_Elementary_Functions;
with Ada.Unchecked_Conversion;

package body Ath_Growth is
   use type Status_Code;
   use type Target_Code;

   type Bits is mod 2 ** 64;

   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);

   function Is_Finite (Value : Long_Float) return Boolean is
      Exponent : constant Bits :=
        (To_Bits (Value) / 2 ** 52) and Bits'(16#7FF#);
   begin
      return Exponent /= 16#7FF#;
   end Is_Finite;

   function Power_Of_Two (Exponent : Long_Float) return Long_Float is
      Rounded : Long_Float;
      Whole   : Integer;
   begin
      if Exponent = 0.0 then
         return 1.0;
      end if;
      --  An integer exponent uses an exact shift. A fractional exponent uses
      --  Exp (x * Log 2). Either result may be non-finite; the caller rejects
      --  that instead of capping it.
      Rounded := Long_Float'Rounding (Exponent);
      if Rounded = Exponent
        and then Rounded >= 0.0
        and then Rounded <= Long_Float (Integer'Last)
      then
         Whole := Integer (Rounded);
         if Whole > 1023 then
            declare
               Huge : Long_Float := Long_Float'Last;
            begin
               return Huge * 2.0;
            end;
         end if;
         return 2.0 ** Whole;
      end if;
      return Ada.Numerics.Long_Elementary_Functions.Exp
        (Exponent * Ada.Numerics.Long_Elementary_Functions.Log (2.0));
   end Power_Of_Two;

   procedure Clear
     (Quantity   : out Long_Float;
      Factor     : out Long_Float;
      Times      : out Sample_Times;
      Quantities : out Sample_Quantities) is
   begin
      Quantity := 0.0;
      Factor := 0.0;
      Times := (others => 0.0);
      Quantities := (others => 0.0);
   end Clear;

   procedure Grow
     (Initial    : Long_Float;
      Doubling   : Long_Float;
      Elapsed    : Long_Float;
      Quantity   : out Long_Float;
      Factor     : out Long_Float;
      Times      : out Sample_Times;
      Quantities : out Sample_Quantities;
      Status     : out Status_Code)
   is
      Exponent : Long_Float;
      Share    : Long_Float;
   begin
      Clear (Quantity, Factor, Times, Quantities);
      if not Is_Finite (Initial) or else not Is_Finite (Doubling)
        or else not Is_Finite (Elapsed)
      then
         Status := Non_Finite_Input;
         return;
      end if;
      if Initial < 0.0 then
         Status := Quantity_Negative;
         return;
      end if;
      if Elapsed < 0.0 then
         Status := Elapsed_Negative;
         return;
      end if;
      if Doubling <= 0.0 then
         Status := Doubling_Not_Positive;
         return;
      end if;

      Exponent := Elapsed / Doubling;
      Factor := Power_Of_Two (Exponent);
      if not Is_Finite (Factor) then
         Clear (Quantity, Factor, Times, Quantities);
         Status := Result_Not_Finite;
         return;
      end if;
      Quantity := Initial * Factor;
      if not Is_Finite (Quantity) then
         Clear (Quantity, Factor, Times, Quantities);
         Status := Result_Not_Finite;
         return;
      end if;

      for Index in Times'Range loop
         if Index = Times'Last then
            Times (Index) := Elapsed;
            Quantities (Index) := Quantity;
         else
            Times (Index) :=
              Elapsed * Long_Float (Index - 1) / Long_Float (Sample_Count - 1);
            Share := Power_Of_Two (Times (Index) / Doubling);
            Quantities (Index) := Initial * Share;
            if not Is_Finite (Times (Index))
              or else not Is_Finite (Share)
              or else not Is_Finite (Quantities (Index))
            then
               Clear (Quantity, Factor, Times, Quantities);
               Status := Result_Not_Finite;
               return;
            end if;
         end if;
      end loop;
      Status := Ok;
   end Grow;

   function Is_Whole_Year (Value : Long_Float) return Boolean is
      Rounded : constant Long_Float := Long_Float'Rounding (Value);
   begin
      return Rounded = Value;
   end Is_Whole_Year;

   function Log2 (Value : Long_Float) return Long_Float is
      Raw       : constant Bits := To_Bits (Value);
      Biased    : constant Bits := (Raw / 2 ** 52) and Bits'(16#7FF#);
      Fraction  : constant Bits := Raw and Bits'(2 ** 52 - 1);
   begin
      --  An exact power of two has a zero fraction. Reading the exponent
      --  avoids a library result such as 1.9999999999999998 for log2(4).
      if Biased > 0 and then Biased < 16#7FF# and then Fraction = 0 then
         return Long_Float (Integer (Biased) - 1023);
      end if;
      return Ada.Numerics.Long_Elementary_Functions.Log (Value)
        / Ada.Numerics.Long_Elementary_Functions.Log (2.0);
   end Log2;

   procedure Chart
     (Initial         : Long_Float;
      Doubling        : Long_Float;
      Elapsed         : Long_Float;
      Start_Year      : Long_Float;
      Quantity        : out Long_Float;
      Factor          : out Long_Float;
      End_Year        : out Long_Float;
      Times           : out Sample_Times;
      Model           : out Sample_Quantities;
      Baseline        : out Sample_Quantities;
      Growth_Status   : out Status_Code;
      Baseline_Status : out Status_Code)
   is
      Elapsed_Times : Sample_Times;
      Model_Values  : Sample_Quantities;
      Base_Quantity : Long_Float;
      Base_Factor   : Long_Float;
      Base_Times    : Sample_Times;
      Base_Values   : Sample_Quantities;
      Base_Status   : Status_Code;
   begin
      Quantity := 0.0;
      Factor := 0.0;
      End_Year := 0.0;
      Times := (others => 0.0);
      Model := (others => 0.0);
      Baseline := (others => 0.0);
      Baseline_Status := Ok;
      if not Is_Finite (Initial) or else not Is_Finite (Doubling)
        or else not Is_Finite (Elapsed) or else not Is_Finite (Start_Year)
      then
         Growth_Status := Non_Finite_Input;
         return;
      end if;
      if Initial < 0.0 then
         Growth_Status := Quantity_Negative;
         return;
      end if;
      if Elapsed < 0.0 then
         Growth_Status := Elapsed_Negative;
         return;
      end if;
      if Doubling <= 0.0 then
         Growth_Status := Doubling_Not_Positive;
         return;
      end if;
      if not Is_Whole_Year (Start_Year) then
         Growth_Status := Year_Not_Integer;
         return;
      end if;
      if Start_Year < Min_Start_Year or else Start_Year > Max_Start_Year then
         Growth_Status := Year_Out_Of_Range;
         return;
      end if;

      Grow
        (Initial, Doubling, Elapsed, Quantity, Factor,
         Elapsed_Times, Model_Values, Growth_Status);
      if Growth_Status /= Ok then
         Quantity := 0.0;
         Factor := 0.0;
         return;
      end if;

      End_Year := Start_Year + Elapsed;
      if not Is_Finite (End_Year) then
         Quantity := 0.0;
         Factor := 0.0;
         End_Year := 0.0;
         Growth_Status := Result_Not_Finite;
         return;
      end if;
      for Index in Times'Range loop
         Times (Index) := Start_Year + Elapsed_Times (Index);
         Model (Index) := Model_Values (Index);
         if not Is_Finite (Times (Index)) then
            Quantity := 0.0;
            Factor := 0.0;
            End_Year := 0.0;
            Times := (others => 0.0);
            Model := (others => 0.0);
            Growth_Status := Result_Not_Finite;
            return;
         end if;
      end loop;

      Grow
        (Initial, Baseline_Doubling, Elapsed, Base_Quantity, Base_Factor,
         Base_Times, Base_Values, Base_Status);
      if Base_Status /= Ok then
         Baseline_Status := Base_Status;
         return;
      end if;
      Baseline := Base_Values;
      Baseline_Status := Ok;
   end Chart;

   procedure Crossing
     (Initial    : Long_Float;
      Doubling   : Long_Float;
      Elapsed    : Long_Float;
      Start_Year : Long_Float;
      Target     : Long_Float;
      Cross_Time : out Long_Float;
      Cross_Year : out Long_Float;
      Status     : out Target_Code)
   is
      Quantity        : Long_Float;
      Factor          : Long_Float;
      End_Year        : Long_Float;
      Times           : Sample_Times;
      Model           : Sample_Quantities;
      Baseline        : Sample_Quantities;
      Growth_Status   : Status_Code;
      Baseline_Status : Status_Code;
      Ratio           : Long_Float;
      Exponent        : Long_Float;
   begin
      Cross_Time := 0.0;
      Cross_Year := 0.0;
      Chart
        (Initial, Doubling, Elapsed, Start_Year, Quantity, Factor, End_Year,
         Times, Model, Baseline, Growth_Status, Baseline_Status);
      if Growth_Status /= Ok then
         Status := Target_No_Scenario;
         return;
      end if;
      if not Is_Finite (Target) or else Target <= 0.0 then
         Status := Target_Invalid;
         return;
      end if;
      if Initial = 0.0 then
         Status := Target_Never;
         return;
      end if;
      if Target <= Initial then
         Cross_Time := 0.0;
         Cross_Year := Start_Year;
         Status := Target_Already;
         return;
      end if;

      Ratio := Target / Initial;
      Exponent := Log2 (Ratio);
      Cross_Time := Doubling * Exponent;
      if not Is_Finite (Cross_Time) then
         Cross_Time := 0.0;
         Status := Target_Not_Finite;
         return;
      end if;
      Cross_Year := Start_Year + Cross_Time;
      if not Is_Finite (Cross_Year) then
         Cross_Time := 0.0;
         Cross_Year := 0.0;
         Status := Target_Not_Finite;
         return;
      end if;
      if Cross_Time > Elapsed then
         Status := Target_Outside;
      else
         Status := Target_Within;
      end if;
   end Crossing;
end Ath_Growth;
