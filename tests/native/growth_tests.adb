with Ada.Command_Line;
with Ada.Text_IO;
with Ada.Unchecked_Conversion;
with Interfaces;
with Ath_Growth;
with Ath_Growth_Exports;

procedure Growth_Tests is
   use type Interfaces.Integer_32;
   use type Ath_Growth.Status_Code;

   type Bits is mod 2 ** 64;
   function To_Bits is new Ada.Unchecked_Conversion (Long_Float, Bits);
   function To_Float is new Ada.Unchecked_Conversion (Bits, Long_Float);

   Failures : Natural := 0;

   function Hex (Value : Bits) return String is
      Alphabet : constant String := "0123456789abcdef";
      Image    : String (1 .. 16) := (others => '0');
      Rest     : Bits := Value;
   begin
      for Index in reverse Image'Range loop
         Image (Index) := Alphabet (Natural (Rest mod 16) + 1);
         Rest := Rest / 16;
      end loop;
      return Image;
   end Hex;

   procedure Fail (Name : String) is
   begin
      Failures := Failures + 1;
      Ada.Text_IO.Put_Line ("FAIL " & Name);
   end Fail;

   procedure Emit
     (Name     : String;
      Initial  : Long_Float;
      Doubling : Long_Float;
      Elapsed  : Long_Float;
      Status   : Ath_Growth.Status_Code;
      Quantity : Long_Float;
      Factor   : Long_Float;
      Times    : Ath_Growth.Sample_Times;
      Values   : Ath_Growth.Sample_Quantities)
   is
   begin
      Ada.Text_IO.Put
        ("GROW " & Name &
         Interfaces.Integer_32'Image (Interfaces.Integer_32 (Status)) & " " &
         Hex (To_Bits (Quantity)) & " " & Hex (To_Bits (Factor)) & " " &
         Hex (To_Bits (Initial)) & " " & Hex (To_Bits (Doubling)) & " " &
         Hex (To_Bits (Elapsed)));
      for Index in Times'Range loop
         Ada.Text_IO.Put
           (" " & Hex (To_Bits (Times (Index))) & " " & Hex (To_Bits (Values (Index))));
      end loop;
      Ada.Text_IO.New_Line;
   end Emit;

   procedure Expect
     (Name             : String;
      Initial          : Long_Float;
      Doubling         : Long_Float;
      Elapsed          : Long_Float;
      Expected_Status  : Ath_Growth.Status_Code;
      Expected_N       : Long_Float := 0.0;
      Expected_Factor  : Long_Float := 0.0)
   is
      Quantity   : Long_Float;
      Factor     : Long_Float;
      Times      : Ath_Growth.Sample_Times;
      Quantities : Ath_Growth.Sample_Quantities;
      Status     : Ath_Growth.Status_Code;
   begin
      Ath_Growth.Grow
        (Initial, Doubling, Elapsed, Quantity, Factor, Times, Quantities, Status);
      if Status /= Expected_Status then
         Fail (Name & " status");
      end if;
      if Expected_Status = Ath_Growth.Ok then
         if Quantity /= Expected_N or else Factor /= Expected_Factor then
            Fail (Name & " value");
         end if;
         if Times (Times'Last) /= Elapsed or else Quantities (Quantities'Last) /= Quantity then
            Fail (Name & " endpoint");
         end if;
         if Times (Times'First) /= 0.0 then
            Fail (Name & " start");
         end if;
      else
         if Quantity /= 0.0 or else Factor /= 0.0 then
            Fail (Name & " cleared");
         end if;
      end if;
      Emit (Name, Initial, Doubling, Elapsed, Status, Quantity, Factor, Times, Quantities);
   end Expect;

   Export_Status : Interfaces.Integer_32;
begin
   Expect ("defaults", 1.0, 15.0, 30.0, Ath_Growth.Ok, 4.0, 4.0);
   Expect ("one-doubling", 1.0, 15.0, 15.0, Ath_Growth.Ok, 2.0, 2.0);
   Expect ("elapsed-zero", 7.5, 15.0, 0.0, Ath_Growth.Ok, 7.5, 1.0);
   Expect ("initial-zero", 0.0, 15.0, 30.0, Ath_Growth.Ok, 0.0, 4.0);
   Expect ("both-zero", 0.0, 15.0, 0.0, Ath_Growth.Ok, 0.0, 1.0);
   Expect ("doubling-zero", 1.0, 0.0, 30.0, Ath_Growth.Doubling_Not_Positive);
   Expect ("doubling-negative", 1.0, -15.0, 30.0, Ath_Growth.Doubling_Not_Positive);
   Expect ("elapsed-negative", 1.0, 15.0, -1.0, Ath_Growth.Elapsed_Negative);
   Expect ("initial-negative", -1.0, 15.0, 30.0, Ath_Growth.Quantity_Negative);
   Expect
     ("nan-doubling", 1.0, To_Float (16#7FF8_0000_0000_0001#), 30.0,
      Ath_Growth.Non_Finite_Input);
   Expect ("overflow", 1.0, 1.0, 20_000.0, Ath_Growth.Result_Not_Finite);

   Export_Status := Ath_Growth_Exports.Ath_Growth_F64 (1.0, 15.0, 30.0, 0.0);
   if Export_Status /= 0
     or else Ath_Growth_Exports.Ath_Growth_Quantity /= 4.0
     or else Ath_Growth_Exports.Ath_Growth_Factor /= 4.0
     or else Ath_Growth_Exports.Ath_Growth_End_Year /= 30.0
     or else Ath_Growth_Exports.Ath_Growth_Sample_Count /= Ath_Growth.Sample_Count
     or else Ath_Growth_Exports.Ath_Growth_Sample_Quantity (Ath_Growth.Sample_Count) /= 4.0
     or else Ath_Growth_Exports.Ath_Growth_Sample_Time (Ath_Growth.Sample_Count) /= 30.0
     or else Ath_Growth_Exports.Ath_Growth_Sample_Time (1) /= 0.0
   then
      Fail ("export defaults");
   end if;
   Export_Status := Ath_Growth_Exports.Ath_Growth_F64 (1.0, 0.0, 30.0, 2026.0);
   if Export_Status /= Ath_Growth.Doubling_Not_Positive
     or else Ath_Growth_Exports.Ath_Growth_Quantity /= 0.0
     or else Ath_Growth_Exports.Ath_Growth_Factor /= 0.0
   then
      Fail ("export clears stale growth");
   end if;

   declare
      Quantity        : Long_Float;
      Factor          : Long_Float;
      End_Year        : Long_Float;
      Times           : Ath_Growth.Sample_Times;
      Model           : Ath_Growth.Sample_Quantities;
      Baseline        : Ath_Growth.Sample_Quantities;
      Growth_Status   : Ath_Growth.Status_Code;
      Baseline_Status : Ath_Growth.Status_Code;
      Cross_Time      : Long_Float;
      Cross_Year      : Long_Float;
      Target_Status   : Ath_Growth.Target_Code;
      Mid             : constant Integer := 1 + (Ath_Growth.Sample_Count - 1) / 2;

      procedure Emit_Chart (Name : String) is
      begin
         Ada.Text_IO.Put_Line
           ("CHART " & Name &
            Interfaces.Integer_32'Image (Interfaces.Integer_32 (Growth_Status)) &
            Interfaces.Integer_32'Image (Interfaces.Integer_32 (Baseline_Status)) &
            " " & Hex (To_Bits (Quantity)) & " " & Hex (To_Bits (Factor)) &
            " " & Hex (To_Bits (End_Year)) &
            " " & Hex (To_Bits (Times (Times'First))) &
            " " & Hex (To_Bits (Times (Mid))) &
            " " & Hex (To_Bits (Times (Times'Last))) &
            " " & Hex (To_Bits (Model (Model'Last))) &
            " " & Hex (To_Bits (Baseline (Baseline'Last))));
      end Emit_Chart;

      procedure Emit_Target (Name : String) is
      begin
         Ada.Text_IO.Put_Line
           ("TARGET " & Name &
            Interfaces.Integer_32'Image (Interfaces.Integer_32 (Target_Status)) &
            " " & Hex (To_Bits (Cross_Time)) & " " & Hex (To_Bits (Cross_Year)));
      end Emit_Target;
   begin
      Ath_Growth.Chart
        (1.0, 15.0, 30.0, 2026.0, Quantity, Factor, End_Year, Times, Model,
         Baseline, Growth_Status, Baseline_Status);
      if Growth_Status /= Ath_Growth.Ok
        or else Quantity /= 4.0 or else Factor /= 4.0 or else End_Year /= 2056.0
        or else Times (Times'First) /= 2026.0
        or else Times (Times'Last) /= 2056.0
        or else Model (Model'Last) /= 4.0
        or else Baseline (Baseline'Last) /= 4.0
        or else Times (Mid) /= 2041.0
        or else Baseline_Status /= Ath_Growth.Ok
      then
         Fail ("chart defaults");
      end if;
      Emit_Chart ("calendar-defaults");

      Ath_Growth.Chart
        (1.0, 14.0, 30.0, 2026.0, Quantity, Factor, End_Year, Times, Model,
         Baseline, Growth_Status, Baseline_Status);
      if Growth_Status /= Ath_Growth.Ok or else End_Year /= 2056.0
        or else Times (Times'First) /= 2026.0 or else Times (Times'Last) /= 2056.0
        or else Baseline (Baseline'Last) /= 4.0
        or else Model (Model'Last) <= Baseline (Baseline'Last)
      then
         Fail ("chart faster doubling shares the domain");
      end if;
      Emit_Chart ("doubling-14");

      Ath_Growth.Crossing
        (1.0, 15.0, 30.0, 2026.0, 4.0, Cross_Time, Cross_Year, Target_Status);
      if Target_Status /= Ath_Growth.Target_Within
        or else Cross_Time /= 30.0 or else Cross_Year /= 2056.0
      then
         Fail ("target four at fifteen");
      end if;
      Emit_Target ("target-four-fifteen");

      Ath_Growth.Crossing
        (1.0, 14.0, 30.0, 2026.0, 4.0, Cross_Time, Cross_Year, Target_Status);
      if Target_Status /= Ath_Growth.Target_Within
        or else Cross_Time /= 28.0 or else Cross_Year /= 2054.0
      then
         Fail ("target four at fourteen");
      end if;
      Emit_Target ("target-four-fourteen");

      Ath_Growth.Crossing
        (1.0, 15.0, 30.0, 2026.0, 1.0, Cross_Time, Cross_Year, Target_Status);
      if Target_Status /= Ath_Growth.Target_Already
        or else Cross_Time /= 0.0 or else Cross_Year /= 2026.0
      then
         Fail ("target already equal");
      end if;
      Emit_Target ("target-already");

      Ath_Growth.Crossing
        (1.0, 15.0, 30.0, 2026.0, 0.5, Cross_Time, Cross_Year, Target_Status);
      if Target_Status /= Ath_Growth.Target_Already or else Cross_Year /= 2026.0
        or else Cross_Time /= 0.0
      then
         Fail ("target already below");
      end if;
      Emit_Target ("target-below");

      Ath_Growth.Crossing
        (0.0, 15.0, 30.0, 2026.0, 10.0, Cross_Time, Cross_Year, Target_Status);
      if Target_Status /= Ath_Growth.Target_Never
        or else Cross_Time /= 0.0 or else Cross_Year /= 0.0
      then
         Fail ("target never from zero");
      end if;
      Emit_Target ("target-never");

      Ath_Growth.Crossing
        (1.0, 15.0, 30.0, 2026.0, 10.0, Cross_Time, Cross_Year, Target_Status);
      if Target_Status /= Ath_Growth.Target_Outside or else Cross_Time <= 30.0
        or else Cross_Year <= 2056.0
      then
         Fail ("target outside horizon");
      end if;
      Emit_Target ("target-outside");

      Ath_Growth.Crossing
        (1.0, 15.0, 30.0, 2026.0, 0.0, Cross_Time, Cross_Year, Target_Status);
      if Target_Status /= Ath_Growth.Target_Invalid
        or else Cross_Year /= 0.0 or else Cross_Time /= 0.0
      then
         Fail ("target zero");
      end if;
      Emit_Target ("target-zero");

      Ath_Growth.Crossing
        (1.0, 15.0, 30.0, 2026.0, -2.0, Cross_Time, Cross_Year, Target_Status);
      if Target_Status /= Ath_Growth.Target_Invalid or else Cross_Year /= 0.0 then
         Fail ("target negative");
      end if;
      Emit_Target ("target-negative");

      Ath_Growth.Chart
        (1.0, 15.0, 30.0, 2026.5, Quantity, Factor, End_Year, Times, Model,
         Baseline, Growth_Status, Baseline_Status);
      if Growth_Status /= Ath_Growth.Year_Not_Integer or else Quantity /= 0.0 then
         Fail ("fractional year");
      end if;

      Ath_Growth.Chart
        (1.0, 15.0, 30.0, 10_001.0, Quantity, Factor, End_Year, Times, Model,
         Baseline, Growth_Status, Baseline_Status);
      if Growth_Status /= Ath_Growth.Year_Out_Of_Range or else End_Year /= 0.0 then
         Fail ("year range");
      end if;

      Ath_Growth.Chart
        (1.0, 100_000.0, 20_000.0, 2026.0, Quantity, Factor, End_Year, Times,
         Model, Baseline, Growth_Status, Baseline_Status);
      if Growth_Status /= Ath_Growth.Ok
        or else Baseline_Status /= Ath_Growth.Result_Not_Finite
        or else Baseline (Baseline'Last) /= 0.0
        or else Model (Model'Last) = 0.0
      then
         Fail ("baseline overflow stays off the chart");
      end if;
      Emit_Chart ("baseline-overflow");

      Export_Status :=
        Ath_Growth_Exports.Ath_Growth_Target_F64 (1.0, 15.0, 30.0, 2026.0, 4.0);
      if Export_Status /= Ath_Growth.Target_Within
        or else Ath_Growth_Exports.Ath_Growth_Target_Year /= 2056.0
        or else Ath_Growth_Exports.Ath_Growth_Target_Elapsed /= 30.0
      then
         Fail ("export target");
      end if;
      Export_Status :=
        Ath_Growth_Exports.Ath_Growth_Target_F64 (1.0, 15.0, 30.0, 2026.0, -1.0);
      if Export_Status /= Ath_Growth.Target_Invalid
        or else Ath_Growth_Exports.Ath_Growth_Target_Year /= 0.0
      then
         Fail ("export target clears");
      end if;
   end;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("GROWTH OK");
   else
      Ada.Text_IO.Put_Line ("GROWTH FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Growth_Tests;
