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

   Export_Status := Ath_Growth_Exports.Ath_Growth_F64 (1.0, 15.0, 30.0);
   if Export_Status /= 0
     or else Ath_Growth_Exports.Ath_Growth_Quantity /= 4.0
     or else Ath_Growth_Exports.Ath_Growth_Factor /= 4.0
     or else Ath_Growth_Exports.Ath_Growth_Sample_Count /= Ath_Growth.Sample_Count
     or else Ath_Growth_Exports.Ath_Growth_Sample_Quantity (Ath_Growth.Sample_Count) /= 4.0
   then
      Fail ("export defaults");
   end if;
   Export_Status := Ath_Growth_Exports.Ath_Growth_F64 (1.0, 0.0, 30.0);
   if Export_Status /= Ath_Growth.Doubling_Not_Positive
     or else Ath_Growth_Exports.Ath_Growth_Quantity /= 0.0
     or else Ath_Growth_Exports.Ath_Growth_Factor /= 0.0
   then
      Fail ("export clears stale growth");
   end if;

   if Failures = 0 then
      Ada.Text_IO.Put_Line ("GROWTH OK");
   else
      Ada.Text_IO.Put_Line ("GROWTH FAILURES" & Failures'Image);
      Ada.Command_Line.Set_Exit_Status (Ada.Command_Line.Failure);
   end if;
end Growth_Tests;
